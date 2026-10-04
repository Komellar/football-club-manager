import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  MatchEvent,
  MatchEventPlayer,
  MatchEventType,
  MatchSimulationState,
  PlayerPosition,
  createSeededRandom,
  getPlayerDismissalMinute,
} from '@repo/core';
import {
  MATCH_SIMULATION_CONFIG as CONFIG,
  OPPONENT_PLAYER_ID_OFFSET,
} from '../constants/match-simulation.constants';

type Random = () => number;
type Role = 'shoot' | 'assist' | 'defend' | 'keeper';
const WEIGHTS: Record<Role, Record<PlayerPosition, number>> = {
  shoot: { goalkeeper: 0, defender: 0.4, midfielder: 1.5, forward: 3 },
  assist: { goalkeeper: 0, defender: 0.8, midfielder: 3, forward: 1.5 },
  defend: { goalkeeper: 0.15, defender: 3, midfielder: 1.8, forward: 0.6 },
  keeper: { goalkeeper: 100, defender: 1, midfielder: 0.5, forward: 0.2 },
};
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** One seeded minute produces a possession and, optionally, a linked sequence of play. */
@Injectable()
export class MatchSimulationEngineService {
  createMatchEvent(
    state: MatchSimulationState,
    type: MatchEventType,
    home?: boolean,
    player?: MatchEventPlayer | null,
    relatedPlayer?: MatchEventPlayer | null,
  ): MatchEvent {
    const team =
      home === undefined ? undefined : home ? state.homeTeam : state.awayTeam;
    return {
      id: randomUUID(),
      matchId: state.matchId,
      type,
      minute: state.currentMinute,
      timestamp: new Date(),
      ...(team ? { teamId: team.id, teamName: team.name } : {}),
      ...(player ? { player } : {}),
      ...(relatedPlayer ? { relatedPlayer } : {}),
    };
  }

  generateRandomEvents(
    state: MatchSimulationState,
    random: Random = createSeededRandom(
      `${state.seed ?? state.matchId}:${state.currentMinute}`,
    ),
  ): MatchEvent[] {
    const homePower = this.teamPower(state, true);
    const awayPower = this.teamPower(state, false);
    const homeControl = homePower.control * CONFIG.HOME_ADVANTAGE_MULTIPLIER;
    if (homeControl + awayPower.control === 0) return [];
    const home = random() < homeControl / (homeControl + awayPower.control);
    state.possession ??= { home: 0, away: 0 };
    state.possession[home ? 'home' : 'away']++;
    const events: MatchEvent[] = [];
    const playId = randomUUID();
    const event = (
      type: MatchEventType,
      side: boolean,
      player: MatchEventPlayer,
      related?: MatchEventPlayer,
    ) => {
      const result = {
        ...this.createMatchEvent(state, type, side, player, related),
        playId,
      };
      events.push(result);
      return result;
    };
    const attack = home ? homePower : awayPower;
    const defense = home ? awayPower : homePower;
    const quality = clamp(
      attack.attack / Math.max(0.1, defense.defense),
      0.4,
      2.2,
    );
    const pick = (side: boolean, role: Role, exclude?: number) =>
      this.selectPlayer(state, side, role, random, events, exclude);

    if (random() < CONFIG.FOUL_PROBABILITY) {
      const fouler = pick(!home, 'defend');
      if (!fouler) return [];
      event(MatchEventType.FOUL, !home, fouler);
      const card = random();
      if (card < CONFIG.RED_GIVEN_FOUL)
        event(MatchEventType.CARD_RED, !home, fouler);
      else if (card < CONFIG.RED_GIVEN_FOUL + CONFIG.YELLOW_GIVEN_FOUL) {
        event(MatchEventType.CARD_YELLOW, !home, fouler);
        const teamId = home ? state.awayTeam.id : state.homeTeam.id;
        if (
          getPlayerDismissalMinute(
            [...state.events, ...events],
            teamId,
            fouler.id,
          ) !== undefined
        )
          event(MatchEventType.CARD_RED, !home, fouler);
      }
      if (random() < CONFIG.PENALTY_GIVEN_FOUL) {
        const taker = pick(home, 'shoot');
        if (!taker) return events;
        const outcome = random();
        const goalkeeper = pick(!home, 'keeper');
        const scored = outcome < CONFIG.PENALTY_GOAL_PROBABILITY;
        const saved =
          !scored &&
          outcome <
            CONFIG.PENALTY_GOAL_PROBABILITY + CONFIG.PENALTY_SAVE_PROBABILITY;
        const penalty = event(MatchEventType.PENALTY, home, taker);
        penalty.penaltyOutcome = scored ? 'scored' : saved ? 'saved' : 'missed';
        const shot = event(
          scored
            ? MatchEventType.GOAL
            : saved
              ? MatchEventType.SHOT_ON_TARGET
              : MatchEventType.SHOT_OFF_TARGET,
          home,
          taker,
        );
        shot.isPenalty = true;
        shot.goalkeeper = goalkeeper;
        if (scored) state.score[home ? 'home' : 'away']++;
      }
      return events;
    }

    if (random() >= clamp(CONFIG.CHANCE_PROBABILITY * quality, 0.1, 0.6))
      return [];
    const shooter = pick(home, 'shoot');
    if (!shooter) return [];
    if (random() < CONFIG.OFFSIDE_GIVEN_CHANCE) {
      event(MatchEventType.OFFSIDE, home, shooter);
      return events;
    }
    const outcome = random();
    const goalChance = clamp(CONFIG.GOAL_GIVEN_SHOT * quality, 0.04, 0.3);
    const goalkeeper = pick(!home, 'keeper');
    if (outcome < goalChance) {
      const assist =
        random() < CONFIG.ASSIST_PROBABILITY
          ? pick(home, 'assist', shooter.id)
          : undefined;
      const goal = event(MatchEventType.GOAL, home, shooter, assist);
      goal.goalkeeper = goalkeeper;
      state.score[home ? 'home' : 'away']++;
    } else if (
      outcome <
      goalChance + (1 - goalChance) * CONFIG.SAVED_GIVEN_NON_GOAL
    ) {
      const shot = event(MatchEventType.SHOT_ON_TARGET, home, shooter);
      shot.goalkeeper = goalkeeper;
    } else {
      event(MatchEventType.SHOT_OFF_TARGET, home, shooter);
      if (random() < CONFIG.CORNER_GIVEN_MISS) {
        const taker = pick(home, 'assist');
        if (taker) event(MatchEventType.CORNER, home, taker);
      }
    }
    return events;
  }

  isHalfTime(minute: number): boolean {
    return minute === CONFIG.HALF_TIME_MINUTE;
  }
  isMatchEnded(minute: number): boolean {
    return minute >= CONFIG.FULL_TIME_MINUTE;
  }
  advanceTime(state: MatchSimulationState): void {
    state.currentMinute = Math.min(
      CONFIG.FULL_TIME_MINUTE,
      state.currentMinute + 1,
    );
  }

  private eligible(
    state: MatchSimulationState,
    home: boolean,
    extra: MatchEvent[] = [],
  ): MatchEventPlayer[] {
    const team = home ? state.homeTeam : state.awayTeam;
    return (team.players ?? this.createOpponentSquad()).filter(
      (player) =>
        getPlayerDismissalMinute(
          [...state.events, ...extra],
          team.id,
          player.id,
        ) === undefined,
    );
  }

  private selectPlayer(
    state: MatchSimulationState,
    home: boolean,
    role: Role,
    random: Random,
    extra: MatchEvent[],
    exclude?: number,
  ): MatchEventPlayer | undefined {
    let players = this.eligible(state, home, extra).filter(
      (player) => player.id !== exclude && WEIGHTS[role][player.position] > 0,
    );
    if (
      role === 'keeper' &&
      players.some((player) => player.position === PlayerPosition.GOALKEEPER)
    )
      players = players.filter(
        (player) => player.position === PlayerPosition.GOALKEEPER,
      );
    const total = players.reduce(
      (sum, player) => sum + WEIGHTS[role][player.position],
      0,
    );
    let draw = random() * total;
    for (const player of players) {
      draw -= WEIGHTS[role][player.position];
      if (draw < 0) return player;
    }
    return players.at(-1);
  }

  private teamPower(state: MatchSimulationState, home: boolean) {
    const team = home ? state.homeTeam : state.awayTeam;
    const players = this.eligible(state, home);
    const strength = team.strength ?? 1;
    const tactic = team.tactic ?? 'balanced';
    const attack =
      players.reduce(
        (sum, p) =>
          sum +
          { goalkeeper: 0, defender: 0.45, midfielder: 1.1, forward: 1.45 }[
            p.position
          ],
        0,
      ) / 9.1;
    const defense =
      players.reduce(
        (sum, p) =>
          sum +
          { goalkeeper: 1, defender: 1.45, midfielder: 0.9, forward: 0.35 }[
            p.position
          ],
        0,
      ) / 11.1;
    const control = players.reduce(
      (sum, p) =>
        sum +
        { goalkeeper: 0.1, defender: 0.6, midfielder: 1.5, forward: 0.9 }[
          p.position
        ],
      0,
    );
    return {
      control: control * strength,
      attack:
        attack *
        strength *
        (tactic === 'attacking' ? 1.12 : tactic === 'defensive' ? 0.9 : 1),
      defense:
        defense *
        strength *
        (tactic === 'defensive' ? 1.1 : tactic === 'attacking' ? 0.92 : 1),
    };
  }

  createOpponentSquad(): MatchEventPlayer[] {
    return Array.from({ length: 11 }, (_, index) => ({
      id: OPPONENT_PLAYER_ID_OFFSET + index + 1,
      name: `Opponent Player ${index + 1}`,
      jerseyNumber: index + 1,
      position:
        index === 0
          ? PlayerPosition.GOALKEEPER
          : index < 5
            ? PlayerPosition.DEFENDER
            : index < 9
              ? PlayerPosition.MIDFIELDER
              : PlayerPosition.FORWARD,
    }));
  }
}
