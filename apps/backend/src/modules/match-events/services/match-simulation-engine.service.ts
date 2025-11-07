import { Injectable } from '@nestjs/common';
import {
  MatchEvent,
  MatchEventPlayer,
  MatchEventType,
  MatchSimulationState,
  PlayerPosition,
} from '@repo/core';
import { v4 as uuidv4 } from 'uuid';
import {
  MATCH_SIMULATION_CONFIG,
  OPPONENT_PLAYER_ID_OFFSET,
} from '../constants/match-simulation.constants';

/**
 * Service responsible for match simulation logic (event generation, scoring, timing)
 * Separated from WebSocket orchestration for better testability and single responsibility
 */
@Injectable()
export class MatchSimulationEngineService {
  createMatchEvent(
    matchState: MatchSimulationState,
    eventType: MatchEventType,
    isHomeTeam?: boolean,
    player?: MatchEventPlayer | null,
    relatedPlayer?: MatchEventPlayer | null,
  ): MatchEvent {
    return {
      id: uuidv4(),
      matchId: matchState.matchId,
      type: eventType,
      minute: matchState.currentMinute,
      timestamp: new Date(),
      teamId: isHomeTeam ? matchState.homeTeam.id : matchState.awayTeam.id,
      teamName: isHomeTeam
        ? matchState.homeTeam.name
        : matchState.awayTeam.name,
      player: player || undefined,
      relatedPlayer: relatedPlayer || undefined,
    };
  }

  generateRandomEvent(matchState: MatchSimulationState): MatchEvent {
    const selectedEventType = this.selectRandom();

    const isHomeTeam =
      Math.random() < MATCH_SIMULATION_CONFIG.HOME_ADVANTAGE_PROBABILITY;

    const player = this.getPlayerForEvent(matchState, isHomeTeam);

    // For goals, randomly assign an assist (80% chance)
    let relatedPlayer: MatchEventPlayer | undefined = undefined;
    if (
      selectedEventType === MatchEventType.GOAL &&
      Math.random() < 0.8 &&
      isHomeTeam
    ) {
      const assistPlayer = this.getPlayerForEvent(matchState, true, player.id);

      relatedPlayer = assistPlayer;
    }

    const event = this.createMatchEvent(
      matchState,
      selectedEventType,
      isHomeTeam,
      player,
      relatedPlayer,
    );

    if (selectedEventType === MatchEventType.GOAL) {
      if (isHomeTeam) {
        matchState.score.home++;
      } else {
        matchState.score.away++;
      }
    }

    return event;
  }

  shouldGenerateEvent(): boolean {
    return Math.random() < MATCH_SIMULATION_CONFIG.EVENT_GENERATION_PROBABILITY;
  }

  isHalfTime(currentMinute: number): boolean {
    return currentMinute === MATCH_SIMULATION_CONFIG.HALF_TIME_MINUTE;
  }

  isMatchEnded(currentMinute: number): boolean {
    return currentMinute >= MATCH_SIMULATION_CONFIG.FULL_TIME_MINUTE;
  }

  advanceTime(matchState: MatchSimulationState): void {
    matchState.currentMinute += MATCH_SIMULATION_CONFIG.MINUTES_PER_TICK;
  }

  private getPlayerForEvent(
    matchState: MatchSimulationState,
    isHomeTeam: boolean,
    playerIdToExclude?: number,
  ): MatchEventPlayer {
    if (isHomeTeam) {
      return this.selectRandomPlayer(
        matchState.homeTeam.players,
        playerIdToExclude,
      );
    }
    // For away team, generate a random opponent player
    return this.generateOpponentPlayer();
  }

  private selectRandom() {
    // Weighted probability for event types
    const eventWeights = [
      { type: MatchEventType.GOAL, weight: 15 },
      { type: MatchEventType.SHOT_ON_TARGET, weight: 10 },
      { type: MatchEventType.SHOT_OFF_TARGET, weight: 10 },
      { type: MatchEventType.CORNER, weight: 8 },
      { type: MatchEventType.FOUL, weight: 8 },
      { type: MatchEventType.CARD_YELLOW, weight: 5 },
      { type: MatchEventType.CARD_RED, weight: 2 },
      // { type: MatchEventType.SUBSTITUTION, weight: 4 },
      { type: MatchEventType.OFFSIDE, weight: 6 },
      { type: MatchEventType.PENALTY, weight: 3 },
    ];

    const totalWeight = eventWeights.reduce((sum, e) => sum + e.weight, 0);
    const randomValue = Math.random() * totalWeight;

    let cumulativeWeight = 0;
    for (const eventWeight of eventWeights) {
      cumulativeWeight += eventWeight.weight;
      if (randomValue <= cumulativeWeight) {
        return eventWeight.type;
      }
    }

    return MatchEventType.GOAL;
  }

  private generateOpponentPlayer(): MatchEventPlayer {
    return {
      id: Math.floor(Math.random() * 1000) + OPPONENT_PLAYER_ID_OFFSET,
      name: `Opponent Player ${Math.floor(Math.random() * 11) + 1}`,
      position: PlayerPosition.FORWARD,
    };
  }

  private selectRandomPlayer(
    players: MatchEventPlayer[],
    playerIdToExclude?: number,
  ): MatchEventPlayer {
    const randomIndex = Math.floor(Math.random() * players.length);

    if (
      playerIdToExclude !== undefined &&
      players[randomIndex].id === playerIdToExclude
    ) {
      return this.selectRandomPlayer(players, playerIdToExclude);
    }

    return players[randomIndex];
  }
}
