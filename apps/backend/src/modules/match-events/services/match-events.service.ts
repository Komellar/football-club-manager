import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  MatchEventType,
  StartMatch,
  MatchEnded,
  MatchSimulationState,
  MatchEvent,
} from '@repo/core';
import { interval, Subject, Subscription, takeUntil, tap } from 'rxjs';
import {
  MATCH_SIMULATION_CONFIG,
  MATCH_INTERNAL_EVENT,
  MATCH_INTERNAL_ENDED,
} from '../constants/match-simulation.constants';
import { MatchSimulationEngineService } from './match-simulation-engine.service';
import { MatchStatisticsProcessorService } from '../../statistics/services/match-statistics-processor.service';
import { getCurrentSeason } from '@/shared/utils/season.helper';
import { randomUUID } from 'crypto';
import { FixturesService } from './fixtures.service';

interface ExtendedMatchSimulationState extends MatchSimulationState {
  destroy$: Subject<void>;
  subscription: Subscription | null;
}

@Injectable()
export class MatchEventsService implements OnModuleDestroy {
  private readonly logger = new Logger(MatchEventsService.name);

  private activeMatch: ExtendedMatchSimulationState | null = null;
  private starting = false;
  private completionRetry: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private readonly simulationEngine: MatchSimulationEngineService,
    private readonly matchStatisticsProcessor: MatchStatisticsProcessorService,
    private readonly eventEmitter: EventEmitter2,
    private readonly fixtures: FixturesService,
  ) {}

  onModuleDestroy() {
    clearTimeout(this.completionRetry);
    if (this.activeMatch) {
      this.activeMatch.destroy$.next();
      this.activeMatch.destroy$.complete();
      this.activeMatch.subscription?.unsubscribe();
      this.activeMatch = null;
    }
  }

  subscribeToMatch(clientId: string): string | null {
    this.logger.log(`Client ${clientId} subscribed to active match`);
    return this.activeMatch?.matchId ?? null;
  }

  unsubscribeFromMatch(clientId: string): void {
    this.logger.log(`Client ${clientId} unsubscribed from active match`);
  }

  handleClientDisconnect(clientId: string): void {
    this.logger.log(`Client ${clientId} disconnected`);
  }

  isMatchActive(): boolean {
    return this.activeMatch !== null;
  }

  getActiveMatchId(): string | null {
    return this.activeMatch?.matchId ?? null;
  }

  getActiveMatch(): MatchSimulationState | null {
    if (!this.activeMatch) return null;
    const { destroy$, subscription, ...state } = this.activeMatch;
    return state;
  }

  async startFixture(id: string): Promise<MatchSimulationState> {
    if (this.starting || this.activeMatch)
      throw new Error('A match is already running');
    this.starting = true;
    let claimed = false;
    try {
      const fixture = await this.fixtures.claim(id);
      claimed = true;
      this.startMatchSimulation({
        fixtureId: fixture.id,
        homeTeam: { id: 1, name: 'My Club', players: fixture.lineup },
        awayTeam: { id: 2, name: fixture.opponentName },
      });
      return this.getActiveMatch()!;
    } catch (error) {
      if (claimed) await this.fixtures.interrupt(id);
      throw error;
    } finally {
      this.starting = false;
    }
  }

  startMatchSimulation(data: StartMatch): string {
    if (this.activeMatch !== null) {
      this.logger.warn('A match is already running');
      throw new Error('A match is already running');
    }

    const matchId = randomUUID();
    const destroy$ = new Subject<void>();

    const matchState: ExtendedMatchSimulationState = {
      ...data,
      matchId,
      score: { home: 0, away: 0 },
      currentMinute: 0,
      destroy$,
      subscription: null,
      events: [],
      startTime: new Date(),
    };

    this.activeMatch = matchState;

    this.createAndBroadcastMatchStateTimeEvent(
      matchState,
      MatchEventType.MATCH_START,
    );

    const subscription = interval(MATCH_SIMULATION_CONFIG.TICK_INTERVAL_MS)
      .pipe(
        takeUntil(destroy$),
        tap(() => this.simulateMatchTick()),
      )
      .subscribe();

    matchState.subscription = subscription;

    this.logger.log(`Match simulation started with id ${matchId}`);
    return matchId;
  }

  private simulateMatchTick(): void {
    if (!this.activeMatch) return;

    this.simulationEngine.advanceTime(this.activeMatch);

    if (this.simulationEngine.isHalfTime(this.activeMatch.currentMinute)) {
      this.createAndBroadcastMatchStateTimeEvent(
        this.activeMatch,
        MatchEventType.HALF_TIME,
      );
    }

    if (this.simulationEngine.isMatchEnded(this.activeMatch.currentMinute)) {
      void this.endMatch();
      return;
    }

    if (this.simulationEngine.shouldGenerateEvent()) {
      const event = this.simulationEngine.generateRandomEvent(this.activeMatch);
      this.activeMatch.events.push(event);
      this.emitMatchEvent(event);
    }
  }

  private emitMatchEvent(event: MatchEvent) {
    this.eventEmitter.emit(MATCH_INTERNAL_EVENT as string, event);
  }

  private async endMatch(): Promise<void> {
    if (!this.activeMatch) return;

    const matchState = this.activeMatch;

    matchState.destroy$.next();
    matchState.destroy$.complete();
    matchState.subscription?.unsubscribe();

    if (
      !matchState.events.some(
        (event) => event.type === MatchEventType.MATCH_END,
      )
    ) {
      this.createAndBroadcastMatchStateTimeEvent(
        matchState,
        MatchEventType.MATCH_END,
      );
    }

    if (matchState.fixtureId) {
      try {
        await this.fixtures.complete(
          matchState.fixtureId,
          this.getActiveMatch()!,
        );
      } catch (error) {
        this.logger.error(
          'Could not save match result; retrying in five seconds',
          error,
        );
        this.completionRetry = setTimeout(() => {
          void this.endMatch();
        }, 5000);
        return;
      }
    }

    const matchEnded: MatchEnded = {
      matchId: matchState.matchId,
      score: matchState.score,
      events: matchState.events,
    };

    this.eventEmitter.emit(MATCH_INTERNAL_ENDED as string, matchEnded);

    this.activeMatch = null;

    try {
      const currentSeason = getCurrentSeason();
      await this.matchStatisticsProcessor.processMatchEvents(
        matchState,
        currentSeason,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update player statistics for match ${matchState.matchId}`,
        error,
      );
    }

    this.logger.log(`Match ${matchState.matchId} ended and cleaned up`);
  }

  private createAndBroadcastMatchStateTimeEvent(
    matchState: ExtendedMatchSimulationState,
    eventType: MatchEventType,
  ): void {
    const event = this.simulationEngine.createMatchEvent(matchState, eventType);
    matchState.events.push(event);
    this.emitMatchEvent(event);
  }
}
