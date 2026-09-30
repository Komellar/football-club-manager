import { MigrationInterface, QueryRunner } from 'typeorm';
export class AddStadiumMaintenanceRates1790812801000
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE stadium_maintenance_rates (effective_from date PRIMARY KEY, monthly_amount numeric(12,2) NOT NULL CHECK (monthly_amount BETWEEN 0 AND 10000000))',
    );
    await queryRunner.query(
      'INSERT INTO stadium_maintenance_rates(effective_from,monthly_amount) SELECT updated_at::date,monthly_maintenance FROM stadium',
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE stadium_maintenance_rates');
  }
}
