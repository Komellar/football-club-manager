import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStadium1790726400000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE stadium (
      id smallint PRIMARY KEY CHECK (id = 1),
      name varchar(100) NOT NULL,
      capacity int NOT NULL CHECK (capacity BETWEEN 1 AND 1000000),
      default_ticket_price numeric(12,2) NOT NULL CHECK (default_ticket_price BETWEEN 0 AND 10000),
      expected_occupancy double precision NOT NULL CHECK (expected_occupancy BETWEEN 0 AND 100),
      monthly_maintenance numeric(12,2) NOT NULL CHECK (monthly_maintenance BETWEEN 0 AND 10000000),
      security_cost numeric(12,2) NOT NULL CHECK (security_cost BETWEEN 0 AND 10000000),
      staffing_cost numeric(12,2) NOT NULL CHECK (staffing_cost BETWEEN 0 AND 10000000),
      cleaning_cost numeric(12,2) NOT NULL CHECK (cleaning_cost BETWEEN 0 AND 10000000),
      utilities_cost numeric(12,2) NOT NULL CHECK (utilities_cost BETWEEN 0 AND 10000000),
      updated_at timestamp NOT NULL DEFAULT now()
    )`);
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE stadium');
  }
}
