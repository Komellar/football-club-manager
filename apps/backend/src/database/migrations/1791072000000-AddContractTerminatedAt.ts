import { MigrationInterface, QueryRunner } from 'typeorm';

/** Wages for a terminated contract stop on this date instead of end_date. */
export class AddContractTerminatedAt1791072000000
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE contracts ADD COLUMN terminated_at date NULL',
    );
    // Best guess for contracts terminated before this column existed.
    await queryRunner.query(
      `UPDATE contracts SET terminated_at = LEAST(end_date, updated_at::date)
       WHERE status = 'terminated'`,
    );
    await queryRunner.query(
      `UPDATE contracts SET status = 'expired'
       WHERE status = 'active' AND end_date < CURRENT_DATE`,
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE contracts DROP COLUMN terminated_at');
  }
}
