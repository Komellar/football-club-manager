"use client";

import { io, Socket } from "socket.io-client";
import type {
  BroadcastMatchEvent,
  StartMatch,
  SubscribeToMatch,
  UnsubscribeFromMatch,
} from "@repo/core";
import { MatchEventsSocketMessage } from "@repo/core";
import { store } from "@/store";
import {
  setConnectionStatus,
  startMatch,
  addMatchEvent,
  endMatch,
  setError,
} from "../store/match-events-slice";

class MatchEventsSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  connect() {
    if (this.socket?.connected) {
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    this.socket = io(`${apiUrl}/match-events`, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      withCredentials: true,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      this.reconnectAttempts = 0;
      store.dispatch(setConnectionStatus(true));
    });

    this.socket.on("disconnect", () => {
      store.dispatch(setConnectionStatus(false));
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        store.dispatch(
          setError(
            "Failed to connect to match events server. Please try again."
          )
        );
      }
    });

    this.socket.on("matchEvent", (data: BroadcastMatchEvent) => {
      store.dispatch(addMatchEvent(data));

      const currentState = store.getState();
      if (currentState.matchEvents.error) {
        store.dispatch(setError(null));
      }
    });

    this.socket.on("matchEnded", () => {
      store.dispatch(endMatch());
    });

    this.socket.on(
      "error",
      (error: {
        status: string;
        message:
          | string
          | {
              message: string;
              formErrors: unknown;
              fieldErrors: Record<string, string[]>;
            };
      }) => {
        let errorMessage: string;
        if (typeof error.message === "string") {
          errorMessage = error.message;
        } else if (error.message && typeof error.message === "object") {
          // Extract field errors if present
          const fieldErrors = error.message.fieldErrors;
          if (fieldErrors && Object.keys(fieldErrors).length > 0) {
            errorMessage = Object.entries(fieldErrors)
              .map(([field, errors]) => `${field}: ${errors.join(", ")}`)
              .join("; ");
          } else {
            errorMessage = error.message.message || "An error occurred";
          }
        } else {
          errorMessage = "An unknown error occurred";
        }

        store.dispatch(setError(errorMessage));
      }
    );
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
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      store.dispatch(setConnectionStatus(false));
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const matchEventsSocket = new MatchEventsSocketService();
