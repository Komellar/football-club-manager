"use client";

import { io, Socket } from "socket.io-client";
import type {
  MatchEvent,
  StartMatch,
  SubscribeToMatch,
  UnsubscribeFromMatch,
} from "@repo/core";
import { MatchEventsSocketMessage, MatchEventType } from "@repo/core";
import { store } from "@/store";
import {
  setConnectionStatus,
  startMatch,
  addMatchEvent,
  endMatch,
  setError,
} from "../store/match-events-slice";
import {
  fromEvent,
  Observable,
  Subject,
  merge,
  filter,
  tap,
  takeUntil,
  map,
  share,
} from "rxjs";

class MatchEventsSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 3;
  private destroy$ = new Subject<void>();

  // Observable streams
  private matchEvents$: Observable<MatchEvent> | null = null;
  private connectionStatus$: Observable<boolean> | null = null;
  private errors$: Observable<string> | null = null;

  connect() {
    if (this.socket?.connected) {
      return;
    }

    // Reset destroy$ for reconnection scenarios
    if (this.destroy$.closed) {
      this.destroy$ = new Subject<void>();
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    this.socket = io(`${apiUrl}/match-events`, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.MAX_RECONNECT_ATTEMPTS,
      withCredentials: true,
    });

    this.setupObservableStreams();
  }

  private setupObservableStreams() {
    if (!this.socket) return;

    const connect$ = fromEvent(this.socket, "connect").pipe(
      map(() => true),
      tap(() => {
        this.reconnectAttempts = 0;
      })
    );

    const disconnect$ = fromEvent(this.socket, "disconnect").pipe(
      map(() => false)
    );

    this.connectionStatus$ = merge(connect$, disconnect$).pipe(
      tap((isConnected) => store.dispatch(setConnectionStatus(isConnected))),
      takeUntil(this.destroy$),
      share()
    );

    this.matchEvents$ = fromEvent<MatchEvent>(this.socket, "matchEvent").pipe(
      tap((event) => {
        store.dispatch(addMatchEvent(event));
        const currentState = store.getState();
        if (currentState.matchEvents.error) {
          store.dispatch(setError(null));
        }
      }),
      takeUntil(this.destroy$),
      share()
    );

    fromEvent(this.socket, "matchEnded")
      .pipe(
        tap(() => store.dispatch(endMatch())),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.errors$ = fromEvent<{
      status: string;
      message:
        | string
        | {
            message: string;
            formErrors: unknown;
            fieldErrors: Record<string, string[]>;
          };
    }>(this.socket, "error").pipe(
      map((error) => {
        if (typeof error.message === "string") {
          return error.message;
        } else if (error.message && typeof error.message === "object") {
          const fieldErrors = error.message.fieldErrors;
          if (fieldErrors && Object.keys(fieldErrors).length > 0) {
            return Object.entries(fieldErrors)
              .map(([field, errors]) => `${field}: ${errors.join(", ")}`)
              .join("; ");
          }
          return error.message.message || "An error occurred";
        }
        return "An unknown error occurred";
      }),
      tap((errorMessage) => store.dispatch(setError(errorMessage))),
      takeUntil(this.destroy$),
      share()
    );

    fromEvent(this.socket, "connect_error")
      .pipe(
        tap((error) => {
          console.error("Connection error:", error);
          this.reconnectAttempts++;
          if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
            store.dispatch(
              setError(
                "Failed to connect to match events server. Please try again."
              )
            );
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    // Auto-subscribe to connection status, events, and errors for state management
    this.connectionStatus$.subscribe();
    this.matchEvents$.subscribe();
    this.errors$.subscribe();
  }

  getMatchEvents$(): Observable<MatchEvent> {
    if (!this.matchEvents$) {
      throw new Error("Socket not connected. Call connect() first.");
    }
    return this.matchEvents$;
  }

  getMatchEventsByType$(eventType: MatchEventType): Observable<MatchEvent> {
    return this.getMatchEvents$().pipe(
      filter((event) => event.type === eventType)
    );
  }

  getConnectionStatus$(): Observable<boolean> {
    if (!this.connectionStatus$) {
      throw new Error("Socket not connected. Call connect() first.");
    }
    return this.connectionStatus$;
  }

  getErrors$(): Observable<string> {
    if (!this.errors$) {
      throw new Error("Socket not connected. Call connect() first.");
    }
    return this.errors$;
  }

  subscribeToMatch(matchId: number) {
    if (!this.socket?.connected) {
      console.error("Socket not connected");
      store.dispatch(setError("Not connected to server"));
      return;
    }

    const data: SubscribeToMatch = { matchId };

    this.socket.emit(
      MatchEventsSocketMessage.SUBSCRIBE_TO_MATCH,
      data,
      (response?: { success: boolean; message: string }) => {
        if (!response?.success) {
          const errorMessage = response?.message || "Unknown error";
          store.dispatch(setError(errorMessage));
        }
      }
    );
  }

  unsubscribeFromMatch(matchId: number) {
    if (!this.socket?.connected) return;

    const data: UnsubscribeFromMatch = { matchId };
    this.socket.emit(
      MatchEventsSocketMessage.UNSUBSCRIBE_FROM_MATCH,
      data,
      (response?: { success: boolean; message: string }) => {
        if (!response?.success) {
          const errorMessage = response?.message || "Unknown error";
          store.dispatch(setError(errorMessage));
        }
      }
    );
  }

  startMatch(matchData: StartMatch) {
    if (!this.socket?.connected) {
      store.dispatch(setError("Not connected to server"));
      return;
    }

    this.socket.emit(
      MatchEventsSocketMessage.START_MATCH,
      matchData,
      (response?: { success: boolean; message: string }) => {
        if (!response?.success) {
          const errorMessage = response?.message || "Unknown error";
          store.dispatch(setError(errorMessage));
        }
      }
    );

    store.dispatch(
      startMatch({
        ...matchData,
        score: { home: 0, away: 0 },
        currentMinute: 0,
        events: [],
        startTime: new Date(),
      })
    );
  }

  disconnect() {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      store.dispatch(setConnectionStatus(false));
    }

    // Reset observables
    this.matchEvents$ = null;
    this.connectionStatus$ = null;
    this.errors$ = null;
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const matchEventsSocket = new MatchEventsSocketService();
