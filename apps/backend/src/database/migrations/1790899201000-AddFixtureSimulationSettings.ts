import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFixtureSimulationSettings1790899201000
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE fixtures ADD COLUMN simulation_settings jsonb',
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE fixtures DROP COLUMN simulation_settings',
    );
  }
}
