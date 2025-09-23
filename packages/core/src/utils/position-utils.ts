import { PlayerPosition } from "../enums/player-position";

export function getPositionDisplayName(position: PlayerPosition): string {
  switch (position) {
    case PlayerPosition.GOALKEEPER:
      return "Goalkeeper";
    case PlayerPosition.DEFENDER:
      return "Defender";
    case PlayerPosition.MIDFIELDER:
      return "Midfielder";
    case PlayerPosition.FORWARD:
      return "Forward";
    default:
      return "Unknown";
  }
}

export function getPositionAbbreviation(position: PlayerPosition): string {
  switch (position) {
    case PlayerPosition.GOALKEEPER:
      return "GK";
    case PlayerPosition.DEFENDER:
      return "DEF";
    case PlayerPosition.MIDFIELDER:
      return "MID";
    case PlayerPosition.FORWARD:
      return "FWD";
    default:
      return "UNK";
  }
}

export function getAllPositions(): PlayerPosition[] {
  return Object.values(PlayerPosition);
}

export function isValidPosition(position: string): position is PlayerPosition {
  return getAllPositions().includes(position as PlayerPosition);
}

export function getPositionCategory(position: PlayerPosition): string {
  return position === PlayerPosition.GOALKEEPER ? "Goalkeeper" : "Outfield";
}

export function getTypicalJerseyRange(position: PlayerPosition): string {
  switch (position) {
    case PlayerPosition.GOALKEEPER:
      return "1, 12, 13, 16, 21-25";
    case PlayerPosition.DEFENDER:
      return "2-6, 12-19, 23-30";
    case PlayerPosition.MIDFIELDER:
      return "4-8, 14-16, 18-25";
    case PlayerPosition.FORWARD:
      return "7-11, 17-21, 26-30";
    default:
      return "Any available";
  }
}

export function getCompatiblePositions(
  position: PlayerPosition
): PlayerPosition[] {
  switch (position) {
    case PlayerPosition.GOALKEEPER:
      return [PlayerPosition.GOALKEEPER];
    case PlayerPosition.DEFENDER:
      return [PlayerPosition.DEFENDER, PlayerPosition.MIDFIELDER];
    case PlayerPosition.MIDFIELDER:
      return [
        PlayerPosition.DEFENDER,
        PlayerPosition.MIDFIELDER,
        PlayerPosition.FORWARD,
      ];
    case PlayerPosition.FORWARD:
      return [PlayerPosition.MIDFIELDER, PlayerPosition.FORWARD];
    default:
      return [];
  }
}
