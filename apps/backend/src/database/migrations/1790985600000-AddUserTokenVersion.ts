import { MigrationInterface, QueryRunner } from 'typeorm';

/** Session tokens embed this value; incrementing it revokes them. */
export class AddUserTokenVersion1790985600000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE users ADD COLUMN token_version integer NOT NULL DEFAULT 0',
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE users DROP COLUMN token_version');
  }
}
