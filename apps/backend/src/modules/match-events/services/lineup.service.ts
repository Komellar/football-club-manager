import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MatchEventPlayer, PlayerPosition } from '@repo/core';
import { Player } from '@/shared/entities/player.entity';

@Injectable()
export class LineupService {
  constructor(
    @InjectRepository(Player) private readonly players: Repository<Player>,
  ) {}

  async candidates(): Promise<MatchEventPlayer[]> {
    return (
      await this.players.find({
        where: { isActive: true },
        order: { name: 'ASC' },
      })
    ).map(this.snapshot);
  }

  async resolve(ids: number[]): Promise<MatchEventPlayer[]> {
    if (ids.length !== 11 || new Set(ids).size !== 11) {
      throw new BadRequestException('Select eleven distinct players');
    }
    const players = await this.players.findBy({ id: In(ids), isActive: true });
    if (players.length !== 11)
      throw new BadRequestException(
        'All selected players must exist and be active',
      );
    if (
      players.filter((p) => p.position === PlayerPosition.GOALKEEPER).length !==
      1
    ) {
      throw new BadRequestException('Select exactly one goalkeeper');
    }
    return ids.map((id) => this.snapshot(players.find((p) => p.id === id)!));
  }

  private snapshot(player: Player): MatchEventPlayer {
    return {
      id: player.id,
      name: player.name,
      position: player.position,
      jerseyNumber: player.jerseyNumber ?? undefined,
    };
  }
}
