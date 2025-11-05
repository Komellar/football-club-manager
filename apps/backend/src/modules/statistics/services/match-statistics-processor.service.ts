import { Injectable, Logger } from '@nestjs/common';
import { PlayerStatisticsService } from './player-statistics.service';
import { MatchEvent, MatchEventType } from '@repo/core';

/**
 * Statistics calculated from match events for a single player
 */
interface PlayerMatchStatistics {
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
}

@Injectable()
export class MatchStatisticsProcessorService {
  private readonly logger = new Logger(MatchStatisticsProcessorService.name);

  constructor(
    private readonly playerStatisticsService: PlayerStatisticsService,
  ) {}

  async processMatchEvents(
    events: MatchEvent[],
    season: string,
    allPlayers: Array<{ id: number; name: string }> = [],
  ): Promise<void> {
    try {
      const playerEventMap = this.groupEventsByPlayer(events);

      const allPlayerIds = new Set<number>(
        allPlayers.map((player) => player.id),
      );

      // Update statistics for each player
      const updatePromises = Array.from(allPlayerIds).map((playerId) => {
        const playerEvents = playerEventMap.get(playerId) || [];
        return this.updatePlayerStatistics(playerId, playerEvents, season);
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

  private async updatePlayerStatistics(
    playerId: number,
    events: MatchEvent[],
    season: string,
  ): Promise<void> {
    const stats = this.calculateStatisticsFromEvents(events);

    try {
      const existingStats =
        await this.playerStatisticsService.findByPlayerAndSeason(
          playerId,
          season,
        );

      if (existingStats) {
        await this.playerStatisticsService.update(existingStats.id, {
          matchesPlayed: existingStats.matchesPlayed + 1,
          goals: existingStats.goals + stats.goals,
          assists: existingStats.assists + stats.assists,
          yellowCards: existingStats.yellowCards + stats.yellowCards,
          redCards: existingStats.redCards + stats.redCards,
        });
      } else {
        await this.playerStatisticsService.create({
          playerId,
          season,
          matchesPlayed: 1,
          goals: stats.goals,
          assists: stats.assists,
          yellowCards: stats.yellowCards,
          redCards: stats.redCards,
          minutesPlayed: 0, // TODO: Track minutes played during match
          cleanSheets: 0, // TODO: Calculate for goalkeepers
          savesMade: 0, // TODO: Calculate for goalkeepers
        });
      }
    } catch (error) {
      this.logger.error(
        `Failed to update statistics for player ${playerId}`,
        error,
      );
    }
  }

  private calculateStatisticsFromEvents(
    events: MatchEvent[],
  ): PlayerMatchStatistics {
    return {
      goals: this.countEventsByType(events, MatchEventType.GOAL),
      assists: 0, // TODO: Track assists in match events (needs metadata or assistPlayer field)
      yellowCards: this.countEventsByType(events, MatchEventType.CARD_YELLOW),
      redCards: this.countEventsByType(events, MatchEventType.CARD_RED),
    };
  }

  private countEventsByType(
    events: MatchEvent[],
    eventType: MatchEventType,
  ): number {
    return events.filter((event) => event.type === eventType).length;
  }
}
