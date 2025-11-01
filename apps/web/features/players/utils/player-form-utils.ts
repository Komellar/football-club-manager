import type {
  PlayerResponseDto,
  CreatePlayerDto,
  ValidCountry,
} from "@repo/core";

export function transformToFormValues(
  player: PlayerResponseDto
): CreatePlayerDto {
  return {
    name: player.name,
    position: player.position,
    dateOfBirth: new Date(player.dateOfBirth),
    country: player.country as ValidCountry,
    height: player.height ?? undefined,
    weight: Number(player.weight) ?? undefined,
    jerseyNumber: player.jerseyNumber ?? undefined,
    marketValue: Number(player.marketValue) ?? undefined,
    isActive: player.isActive,
    imageUrl: player.imageUrl ?? undefined,
  };
}
