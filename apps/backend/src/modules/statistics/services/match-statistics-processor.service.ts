import { Injectable, Logger } from '@nestjs/common';
import { PlayerStatisticsService } from './player-statistics.service';
import {
  CreatePlayerStatisticsDto,
  MatchEvent,
  MatchEventType,
  MatchSimulationState,
  PlayerPosition,
} from '@repo/core';

/**
 * Statistics calculated from match events for a single player
 */
@Injectable()
export class MatchStatisticsProcessorService {
  private readonly logger = new Logger(MatchStatisticsProcessorService.name);

  constructor(
    private readonly playerStatisticsService: PlayerStatisticsService,
  ) {}

  async processMatchEvents(
    matchState: MatchSimulationState,
    season: string,
  ): Promise<void> {
    try {
      const myClubEvents = matchState.events.filter(
        (event) => event.teamId === matchState.homeTeam.id,
      );
      const opponentClubEvents = matchState.events.filter(
        (event) => event.teamId === matchState.awayTeam.id,
      );

      const playerEventMap = this.groupEventsByPlayer(myClubEvents);
      const playerAssistMap = this.groupAssistsByPlayer(myClubEvents);

      const allHomePlayerIds = new Set<number>(
        matchState.homeTeam.players.map((player) => player.id),
      );

      // Create a map of player IDs to their positions from the match squad data
      const playerPositionMap = new Map<number, PlayerPosition>(
        matchState.homeTeam.players.map((p) => [p.id, p.position]),
      );

      const savesMade = this.countEventsByType(
        opponentClubEvents,
        MatchEventType.SHOT_ON_TARGET,
      );

      // Update statistics for each player
      const updatePromises = Array.from(allHomePlayerIds).map((playerId) => {
        const playerEvents = playerEventMap.get(playerId) || [];
        const assists = playerAssistMap.get(playerId) || 0;
        const playerPosition = playerPositionMap.get(playerId);
        const isGoalkeeper = playerPosition === PlayerPosition.GOALKEEPER;

        return this.updatePlayerStatistics(
          playerId,
          playerEvents,
          assists,
          isGoalkeeper ? matchState.score.away : 0,
          isGoalkeeper ? savesMade : 0,
          season,
        );
      });

      await Promise.allSettled(updatePromises);
    } catch (error) {
      this.logger.error('Failed to process match events', error);
      throw error;
    }
  }

  private groupEventsByPlayer(events: MatchEvent[]): Map<number, MatchEvent[]> {
    const playerEventMap = new Map<number, MatchEvent[]>();

    for (const event of events) {
      if (event.player?.id) {
        const playerId = event.player.id;
        if (!playerEventMap.has(playerId)) {
          playerEventMap.set(playerId, []);
        }
        playerEventMap.get(playerId)!.push(event);
      }
    }

    return playerEventMap;
  }

  private groupAssistsByPlayer(events: MatchEvent[]): Map<number, number> {
    const assistMap = new Map<number, number>();

    for (const event of events) {
      if (event.type === MatchEventType.GOAL && event.relatedPlayer) {
        const { id: assistId } = event.relatedPlayer;
        assistMap.set(assistId, (assistMap.get(assistId) || 0) + 1);
      }
    }

    return assistMap;
  }

  private async updatePlayerStatistics(
    playerId: number,
    events: MatchEvent[],
    assists: number,
    goalsConceded: number,
    savesMade: number,
    season: string,
  ): Promise<void> {
    const stats = this.calculateStatisticsFromEvents(
      events,
      assists,
      goalsConceded,
      savesMade,
    );

    try {
      await this.playerStatisticsService.create({
        playerId,
        season,
        ...stats,
      });
    } catch (error) {
      this.logger.error(
        `Failed to update statistics for player ${playerId}`,
        error,
      );
    }
  }

  private calculateStatisticsFromEvents(
    events: MatchEvent[],
    assists: number,
    goalsConceded: number,
    savesMade: number,
  ): Omit<CreatePlayerStatisticsDto, 'playerId' | 'season'> {
    const stats = {
      minutesPlayed: 90, // TODO: Track minutes played during match
      goals: this.countEventsByType(events, MatchEventType.GOAL),
      assists,
      savesMade,
      goalsConceded,
      fouls: this.countEventsByType(events, MatchEventType.FOUL),
      yellowCards: this.countEventsByType(events, MatchEventType.CARD_YELLOW),
      redCards:
        this.countEventsByType(events, MatchEventType.CARD_YELLOW) === 2
          ? 1
          : this.countEventsByType(events, MatchEventType.CARD_RED),
      shotsOffTarget: this.countEventsByType(
        events,
        MatchEventType.SHOT_OFF_TARGET,
      ),
      shotsOnTarget:
        this.countEventsByType(events, MatchEventType.SHOT_ON_TARGET) +
        this.countEventsByType(events, MatchEventType.GOAL),
    };

    return {
      ...stats,
      rating: this.calculateRating(stats),
    };
  }

  private countEventsByType(
    events: MatchEvent[],
    eventType: MatchEventType,
  ): number {
    return events.filter((event) => event.type === eventType).length;
  }

  private calculateRating(
    stats: Omit<CreatePlayerStatisticsDto, 'playerId' | 'season'>,
  ): number {
    let rating = 6.0; // Base rating
    rating +=
      stats.goals * 1.0 +
      stats.assists * 0.5 +
      stats.shotsOnTarget * 0.2 +
      stats.shotsOffTarget * 0.1 +
      stats.savesMade * 0.2 -
      stats.fouls * 0.1 -
      stats.yellowCards * 0.5 -
      stats.redCards * 2.0 -
      stats.goalsConceded * 0.3;

    return Math.min(Math.max(rating, 1.0), 10.0);
  }
}
