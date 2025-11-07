import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Server } from 'socket.io';
import {
  MatchEventType,
  StartMatch,
  MatchEnded,
  MatchSimulationState,
  MatchEvent,
} from '@repo/core';
import { interval, Subject, Subscription, takeUntil, tap } from 'rxjs';
import { MATCH_SIMULATION_CONFIG } from '../constants/match-simulation.constants';
import { MatchSimulationEngineService } from './match-simulation-engine.service';
import { MatchStatisticsProcessorService } from '../../statistics/services/match-statistics-processor.service';
import { getCurrentSeason } from '@/shared/utils/season.helper';

interface ExtendedMatchSimulationState extends MatchSimulationState {
  destroy$: Subject<void>;
  subscription: Subscription | null;
}

@Injectable()
export class MatchEventsService implements OnModuleDestroy {
  private server: Server;
  private readonly logger = new Logger(MatchEventsService.name);

  private clientSubscriptions: Map<string, Set<number>> = new Map();
  private activeMatches: Map<number, ExtendedMatchSimulationState> = new Map();
  private matchEvents$ = new Subject<MatchEvent>();

  constructor(
    private readonly simulationEngine: MatchSimulationEngineService,
    private readonly matchStatisticsProcessor: MatchStatisticsProcessorService,
  ) {}

  onModuleDestroy() {
    // Clean up all active matches when service is destroyed
    this.activeMatches.forEach((matchState) => {
      matchState.destroy$.next();
      matchState.destroy$.complete();
      if (matchState.subscription) {
        matchState.subscription.unsubscribe();
      }
    });
    this.activeMatches.clear();
    this.matchEvents$.complete();
  }

  setServer(server: Server) {
    this.server = server;
  }

  subscribeToMatch(clientId: string, matchId: number) {
    if (!this.clientSubscriptions.has(clientId)) {
      this.clientSubscriptions.set(clientId, new Set());
    }
    this.clientSubscriptions.get(clientId)!.add(matchId);
    this.logger.log(`Client ${clientId} subscribed to match ${matchId}`);
  }

  unsubscribeFromMatch(clientId: string, matchId: number) {
    const subscriptions = this.clientSubscriptions.get(clientId);
    if (subscriptions) {
      subscriptions.delete(matchId);
      this.logger.log(`Client ${clientId} unsubscribed from match ${matchId}`);
    }
  }

  handleClientDisconnect(clientId: string) {
    const subscriptions = this.clientSubscriptions.get(clientId);
    if (subscriptions) {
      this.logger.log(
        `Cleaning up subscriptions for disconnected client ${clientId}`,
      );
      this.clientSubscriptions.delete(clientId);
    }
  }

  isMatchActive(matchId: number): boolean {
    return this.activeMatches.has(matchId);
  }

  startMatchSimulation(data: StartMatch): void {
    if (this.activeMatches.has(data.matchId)) {
      this.logger.warn(`Match ${data.matchId} is already running`);
      throw new Error(`Match ${data.matchId} is already running`);
    }

    const destroy$ = new Subject<void>();

    const matchState: ExtendedMatchSimulationState = {
      ...data,
      score: {
        home: 0,
        away: 0,
      },
      currentMinute: 0,
      destroy$,
      subscription: null,
      events: [],
      startTime: new Date(),
    };

    this.activeMatches.set(data.matchId, matchState);

    // Broadcast match start event
    this.createAndBroadcastMatchStateTimeEvent(
      matchState,
      MatchEventType.MATCH_START,
    );

    const subscription = interval(MATCH_SIMULATION_CONFIG.TICK_INTERVAL_MS)
      .pipe(
        takeUntil(destroy$),
        tap(() => {
          this.simulateMatchTick(data.matchId);
        }),
      )
      .subscribe();

    matchState.subscription = subscription;
  }

  private simulateMatchTick(matchId: number): void {
    const matchState = this.activeMatches.get(matchId);
    if (!matchState) return;

    this.simulationEngine.advanceTime(matchState);

    if (this.simulationEngine.isHalfTime(matchState.currentMinute)) {
      this.createAndBroadcastMatchStateTimeEvent(
        matchState,
        MatchEventType.HALF_TIME,
      );
    }

    if (this.simulationEngine.isMatchEnded(matchState.currentMinute)) {
      void this.endMatch(matchId);
      return;
    }

    // Random event generation
    if (this.simulationEngine.shouldGenerateEvent()) {
      const event = this.simulationEngine.generateRandomEvent(matchState);

      matchState.events.push(event);
      this.broadcastMatchEvent(matchState.matchId, event);
    }
  }

  private broadcastMatchEvent(matchId: number, event: MatchEvent) {
    if (!this.server) {
      this.logger.error('Server not initialized');
      return;
    }

    const room = `match:${matchId}`;
    this.server.to(room).emit('matchEvent', event);

    this.matchEvents$.next(event);
  }

  private async endMatch(matchId: number): Promise<void> {
    const matchState = this.activeMatches.get(matchId);
    if (!matchState) return;

    // Stop the RxJS interval stream
    matchState.destroy$.next();
    matchState.destroy$.complete();
    if (matchState.subscription) {
      matchState.subscription.unsubscribe();
    }

    this.createAndBroadcastMatchStateTimeEvent(
      matchState,
      MatchEventType.MATCH_END,
    );

    const matchEnded: MatchEnded = {
      matchId: matchState.matchId,
      score: matchState.score,
      events: matchState.events,
    };

    this.server.to(`match:${matchId}`).emit('matchEnded', matchEnded);

    // Process match events and update player statistics
    try {
      const currentSeason = getCurrentSeason();

      await this.matchStatisticsProcessor.processMatchEvents(
        matchState,
        currentSeason,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update player statistics for match ${matchId}`,
        error,
      );
    }

    this.activeMatches.delete(matchId);
    this.logger.log(`Match ${matchId} ended and cleaned up`);
  }

  private createAndBroadcastMatchStateTimeEvent(
    matchState: ExtendedMatchSimulationState,
    eventType: MatchEventType,
  ): void {
    const event = this.simulationEngine.createMatchEvent(matchState, eventType);
    matchState.events.push(event);
    this.broadcastMatchEvent(matchState.matchId, event);
  }
}
