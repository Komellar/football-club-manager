import { MigrationInterface, QueryRunner } from 'typeorm';
export class AddFixtureTicketing1790812800000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE fixtures ADD COLUMN ticket_price numeric(12,2) CHECK (ticket_price BETWEEN 0 AND 10000), ADD COLUMN matchday jsonb',
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE fixtures DROP COLUMN matchday, DROP COLUMN ticket_price',
    );
  }
}
