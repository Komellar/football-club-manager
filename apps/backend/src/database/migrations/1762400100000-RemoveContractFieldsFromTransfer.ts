import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveContractFieldsFromTransfer1762400100000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove contract-related fields from transfers table
    await queryRunner.query(
      `ALTER TABLE "transfers" DROP COLUMN "annual_salary"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfers" DROP COLUMN "contract_length_months"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfers" DROP COLUMN "is_permanent"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore contract-related fields to transfers table
    await queryRunner.query(
      `ALTER TABLE "transfers" ADD "is_permanent" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfers" ADD "contract_length_months" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfers" ADD "annual_salary" numeric(10,2)`,
    );
  }
}
