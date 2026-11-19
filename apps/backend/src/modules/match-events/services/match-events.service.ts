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
  MATCH_INTERNAL_STATE,
  MATCH_ENGINE_VERSION,
} from '../constants/match-simulation.constants';
import { MatchSimulationEngineService } from './match-simulation-engine.service';
import { randomUUID } from 'crypto';
import { FixturesService } from './fixtures.service';

/** Saves that fail this many times in a row are given up on. */
export const MAX_COMPLETION_ATTEMPTS = 5;
const COMPLETION_RETRY_BASE_MS = 5000;

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
  private completionAttempts = 0;

  constructor(
    private readonly simulationEngine: MatchSimulationEngineService,
    private readonly eventEmitter: EventEmitter2,
    private readonly fixtures: FixturesService,
  ) {}

  onModuleDestroy() {
    clearTimeout(this.completionRetry);
    this.completionAttempts = 0;
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
    const {
      destroy$: _destroy,
      subscription: _subscription,
      ...state
    } = this.activeMatch;
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
        homeTeam: {
          id: 1,
          name: 'My Club',
          players: fixture.lineup,
          strength: fixture.simulationSettings?.homeStrength,
          tactic: fixture.simulationSettings?.homeTactic,
        },
        awayTeam: {
          id: 2,
          name: fixture.opponentName,
          strength: fixture.simulationSettings?.opponentStrength,
          tactic: fixture.simulationSettings?.opponentTactic,
        },
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
      awayTeam: {
        ...data.awayTeam,
        players:
          data.awayTeam.players ?? this.simulationEngine.createOpponentSquad(),
      },
      matchId,
      score: { home: 0, away: 0 },
      currentMinute: 0,
      destroy$,
      subscription: null,
      events: [],
      startTime: new Date(),
      seed: data.seed ?? randomUUID(),
      engineVersion: MATCH_ENGINE_VERSION,
      phase: 'first_half',
      possession: { home: 0, away: 0 },
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
    if (!this.activeMatch || this.activeMatch.phase === 'saving') return;
    if (this.activeMatch.phase === 'half_time')
      this.activeMatch.phase = 'second_half';
    for (
      let minute = 0;
      minute < MATCH_SIMULATION_CONFIG.MINUTES_PER_TICK;
      minute++
    ) {
      const state = this.activeMatch;
      this.simulationEngine.advanceTime(state);
      for (const event of this.simulationEngine.generateRandomEvents(state)) {
        state.events.push(event);
        this.emitMatchEvent(event);
      }
      if (this.simulationEngine.isMatchEnded(state.currentMinute)) {
        void this.endMatch();
        return;
      }
      if (this.simulationEngine.isHalfTime(state.currentMinute)) {
        state.phase = 'half_time';
        this.createAndBroadcastMatchStateTimeEvent(
          state,
          MatchEventType.HALF_TIME,
        );
        break;
      }
    }
    this.emitMatchState();
  }

  private emitMatchState(): void {
    const state = this.getActiveMatch();
    if (state) this.eventEmitter.emit(MATCH_INTERNAL_STATE, state);
  }

  private emitMatchEvent(event: MatchEvent) {
    this.eventEmitter.emit(MATCH_INTERNAL_EVENT as string, event);
  }

  private async endMatch(): Promise<void> {
    this.completionRetry = undefined;
    if (!this.activeMatch) return;

    const matchState = this.activeMatch;
    matchState.phase = 'saving';

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

    this.emitMatchState();
    if (matchState.fixtureId) {
      try {
        await this.fixtures.complete(matchState.fixtureId, {
          ...this.getActiveMatch()!,
          phase: 'completed',
        });
      } catch (error) {
        this.completionAttempts++;
        if (this.completionAttempts >= MAX_COMPLETION_ATTEMPTS) {
          this.logger.error(
            `Could not save match result after ${this.completionAttempts} attempts; marking the fixture as interrupted`,
            error,
          );
          await this.abandonMatch(matchState);
          return;
        }
        const delay =
          COMPLETION_RETRY_BASE_MS * 2 ** (this.completionAttempts - 1);
        this.logger.error(
          `Could not save match result; retrying in ${delay / 1000} seconds`,
          error,
        );
        this.completionRetry = setTimeout(() => {
          void this.endMatch();
        }, delay);
        this.emitMatchState();
        return;
      }
    }
    this.completionAttempts = 0;

    const matchEnded: MatchEnded = {
      matchId: matchState.matchId,
      score: matchState.score,
      events: matchState.events,
      phase: 'completed',
    };
    matchState.phase = 'completed';
    this.emitMatchState();

    this.eventEmitter.emit(MATCH_INTERNAL_ENDED as string, matchEnded);

    this.activeMatch = null;

    this.logger.log(`Match ${matchState.matchId} ended and cleaned up`);
  }

  /**
   * Frees the engine when the result can't be stored, so one broken save
   * doesn't block every later match until a restart.
   */
  private async abandonMatch(
    matchState: ExtendedMatchSimulationState,
  ): Promise<void> {
    this.completionAttempts = 0;
    matchState.phase = 'interrupted';
    if (matchState.fixtureId) {
      try {
        await this.fixtures.interrupt(matchState.fixtureId);
      } catch (error) {
        // Startup marks leftover in_progress fixtures as interrupted anyway.
        this.logger.error('Could not mark the fixture as interrupted', error);
      }
    }
    this.emitMatchState();
    this.eventEmitter.emit(MATCH_INTERNAL_ENDED as string, {
      matchId: matchState.matchId,
      score: matchState.score,
      events: matchState.events,
      phase: 'interrupted',
    } satisfies MatchEnded);
    this.activeMatch = null;
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
