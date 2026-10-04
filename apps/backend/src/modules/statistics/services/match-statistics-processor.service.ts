import { Injectable } from '@nestjs/common';
import {
  CreatePlayerStatisticsDto,
  MatchEvent,
  MatchEventType,
  MatchSimulationState,
  PlayerPosition,
  getPlayerDismissalMinute,
} from '@repo/core';

/** Calculates rows without writing them; fixture completion owns the transaction. */
@Injectable()
export class MatchStatisticsProcessorService {
  calculateMatchStatistics(
    matchState: MatchSimulationState,
    season: string,
  ): CreatePlayerStatisticsDto[] {
    const homeEvents = matchState.events.filter(
      (event) => event.teamId === matchState.homeTeam.id,
    );
    const awayEvents = matchState.events.filter(
      (event) => event.teamId === matchState.awayTeam.id,
    );

    return matchState.homeTeam.players.map((player) => {
      const dismissalMinute = getPlayerDismissalMinute(
        homeEvents,
        matchState.homeTeam.id,
        player.id,
      );
      const minutesPlayed = Math.min(
        matchState.currentMinute,
        dismissalMinute ?? matchState.currentMinute,
      );
      const playerEvents = homeEvents.filter(
        (event) =>
          event.player?.id === player.id && event.minute <= minutesPlayed,
      );
      const goalkeeperEvents = awayEvents.filter(
        (event) =>
          dismissalMinute === undefined || event.minute < dismissalMinute,
      );
      const isGoalkeeper = player.position === PlayerPosition.GOALKEEPER;
      const keeperEvents = goalkeeperEvents.filter((event) =>
        event.goalkeeper ? event.goalkeeper.id === player.id : isGoalkeeper,
      );
      const stats = {
        minutesPlayed,
        goals: this.countEvents(playerEvents, MatchEventType.GOAL),
        assists: homeEvents.filter(
          (event) =>
            event.type === MatchEventType.GOAL &&
            event.relatedPlayer?.id === player.id &&
            event.player?.id !== player.id &&
            event.minute <= minutesPlayed,
        ).length,
        yellowCards: Math.min(
          2,
          this.countEvents(playerEvents, MatchEventType.CARD_YELLOW),
        ),
        redCards: dismissalMinute === undefined ? 0 : 1,
        savesMade: this.countEvents(
          keeperEvents,
          MatchEventType.SHOT_ON_TARGET,
        ),
        goalsConceded: this.countEvents(keeperEvents, MatchEventType.GOAL),
        fouls: this.countEvents(playerEvents, MatchEventType.FOUL),
        shotsOffTarget: this.countEvents(
          playerEvents,
          MatchEventType.SHOT_OFF_TARGET,
        ),
        shotsOnTarget:
          this.countEvents(playerEvents, MatchEventType.SHOT_ON_TARGET) +
          this.countEvents(playerEvents, MatchEventType.GOAL),
      };
      return {
        playerId: player.id,
        season,
        ...stats,
        rating: this.calculateRating(stats),
      };
    });
  }

  private countEvents(events: MatchEvent[], type: MatchEventType): number {
    return events.filter((event) => event.type === type).length;
  }

  private calculateRating(
    stats: Omit<CreatePlayerStatisticsDto, 'playerId' | 'season'>,
  ): number {
    const rating =
      6 +
      stats.goals +
      stats.assists * 0.5 +
      stats.shotsOnTarget * 0.2 +
      stats.shotsOffTarget * 0.1 +
      stats.savesMade * 0.2 -
      stats.fouls * 0.1 -
      stats.yellowCards * 0.5 -
      stats.redCards * 2 -
      stats.goalsConceded * 0.3;
    return Math.round(Math.min(Math.max(rating, 1), 10) * 10) / 10;
  }
}
