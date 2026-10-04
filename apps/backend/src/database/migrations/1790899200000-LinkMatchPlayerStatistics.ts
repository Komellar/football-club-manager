import { MigrationInterface, QueryRunner } from 'typeorm';

export class LinkMatchPlayerStatistics1790899200000
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE player_statistics ADD COLUMN match_id uuid',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX player_statistics_match_player_idx ON player_statistics (match_id, player_id)',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX player_statistics_match_player_idx');
    await queryRunner.query(
      'ALTER TABLE player_statistics DROP COLUMN match_id',
    );
  }
}
