import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import {
  BroadcastMatchEvent,
  MatchEventType,
  StartMatch,
  MatchEnded,
  MatchSimulationState,
} from '@repo/core';
import { MATCH_SIMULATION_CONFIG } from '../constants/match-simulation.constants';
import { MatchSimulationEngineService } from './match-simulation-engine.service';

interface ExtendedMatchSimulationState extends MatchSimulationState {
  timer: NodeJS.Timeout | null;
}

@Injectable()
export class MatchEventsService {
  private server: Server;
  private readonly logger = new Logger(MatchEventsService.name);

  private clientSubscriptions: Map<string, Set<number>> = new Map();
  private activeMatches: Map<number, ExtendedMatchSimulationState> = new Map();

  constructor(
    private readonly simulationEngine: MatchSimulationEngineService,
  ) {}

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

    const matchState: ExtendedMatchSimulationState = {
      ...data,
      score: {
        home: 0,
        away: 0,
      },
      currentMinute: 0,
      timer: null,
      events: [],
      startTime: new Date(),
    };

    this.activeMatches.set(data.matchId, matchState);

    // Broadcast match start event
    this.createAndBroadcastMatchStateTimeEvent(
      matchState,
      MatchEventType.MATCH_START,
    );

    // Start the simulation timer
    matchState.timer = setInterval(() => {
      this.simulateMatchTick(data.matchId);
    }, MATCH_SIMULATION_CONFIG.TICK_INTERVAL_MS);

    this.logger.log(`Match simulation started for match ${data.matchId}`);
  }

  private broadcastMatchEvent(matchId: number, event: BroadcastMatchEvent) {
    if (!this.server) {
      this.logger.error('Server not initialized');
      return;
    }

    const room = `match:${matchId}`;
    this.server.to(room).emit('matchEvent', event);
    this.logger.log(
      `Broadcasted ${event.event.type} event for match ${matchId}`,
    );
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
      this.endMatch(matchId);
      return;
    }

    // Random event generation
    if (this.simulationEngine.shouldGenerateEvent()) {
      const event = this.simulationEngine.generateRandomEvent(matchState);

      matchState.events.push(event);
      this.broadcastMatchEvent(matchState.matchId, {
        event,
      });
    }
  }

  private endMatch(matchId: number): void {
    const matchState = this.activeMatches.get(matchId);
    if (!matchState) return;

    if (matchState.timer) {
      clearInterval(matchState.timer);
      matchState.timer = null;
    }

    this.createAndBroadcastMatchStateTimeEvent(
      matchState,
      MatchEventType.MATCH_END,
    );

    // Broadcast match ended summary
    const matchEnded: MatchEnded = {
      matchId: matchState.matchId,
      score: matchState.score,
      events: matchState.events,
    };

    this.server.to(`match:${matchId}`).emit('matchEnded', matchEnded);

    this.activeMatches.delete(matchId);
    this.logger.log(`Match ${matchId} ended and cleaned up`);
  }

  private createAndBroadcastMatchStateTimeEvent(
    matchState: ExtendedMatchSimulationState,
    eventType: MatchEventType,
  ): void {
    const event = this.simulationEngine.createMatchEvent(matchState, eventType);
    matchState.events.push(event);
    this.broadcastMatchEvent(matchState.matchId, {
      event,
    });
  }
}
