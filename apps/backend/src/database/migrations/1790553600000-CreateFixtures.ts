import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFixtures1790553600000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE fixtures (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      opponent_name varchar(100) NOT NULL,
      competition varchar(100) NOT NULL,
      kickoff_at timestamptz NOT NULL,
      status varchar(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','in_progress','completed','interrupted','cancelled')),
      lineup jsonb NOT NULL DEFAULT '[]'::jsonb,
      result jsonb,
      completed_at timestamptz,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )`);
    await queryRunner.query(
      'CREATE INDEX fixtures_status_kickoff_idx ON fixtures(status, kickoff_at)',
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE fixtures');
  }
}
