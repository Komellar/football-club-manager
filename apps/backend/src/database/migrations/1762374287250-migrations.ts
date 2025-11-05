import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1762374287250 implements MigrationInterface {
    name = 'Migrations1762374287250'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player_statistics" DROP COLUMN "matches_played"`);
        await queryRunner.query(`ALTER TABLE "player_statistics" DROP COLUMN "clean_sheets"`);
        await queryRunner.query(`ALTER TABLE "player_statistics" DROP COLUMN "average_rating"`);
        await queryRunner.query(`ALTER TABLE "player_statistics" ADD "goals_conceded" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "player_statistics" ADD "shots_on_target" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "player_statistics" ADD "shots_off_target" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "player_statistics" ADD "fouls" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player_statistics" DROP COLUMN "fouls"`);
        await queryRunner.query(`ALTER TABLE "player_statistics" DROP COLUMN "shots_off_target"`);
        await queryRunner.query(`ALTER TABLE "player_statistics" DROP COLUMN "shots_on_target"`);
        await queryRunner.query(`ALTER TABLE "player_statistics" DROP COLUMN "goals_conceded"`);
        await queryRunner.query(`ALTER TABLE "player_statistics" ADD "average_rating" numeric(3,1)`);
        await queryRunner.query(`ALTER TABLE "player_statistics" ADD "clean_sheets" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "player_statistics" ADD "matches_played" integer NOT NULL DEFAULT '0'`);
    }

}
