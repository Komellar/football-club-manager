import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1771530140304 implements MigrationInterface {
    name = 'Migrations1771530140304'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sponsorships" DROP COLUMN "description"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sponsorships" ADD "description" text`);
    }

}
