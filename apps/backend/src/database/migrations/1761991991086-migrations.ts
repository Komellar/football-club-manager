import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1761991991086 implements MigrationInterface {
    name = 'Migrations1761991991086'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_fc3fcf4efc5206c428a5b2e1e7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_321ed25dcd320a864537758f14"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9ddf2a26a144b70987a76aa3d2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_db11685567d03c81304044fa21"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_646d12094f9b3f688f4e189d4b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_78fd0b9f9cbfc7869ca4d9f5e3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_58731e4def2688e0466eeb9100"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d08c72b23722a1d42e646f2f0c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_66381ccee426b9b1c36fb5c9f2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6bf33c850e86c8eb1509bf04b6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2602554578bdc7e10db9ad5ce7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9b9811b083c078840b2152cbd8"`);
        await queryRunner.query(`ALTER TABLE "players" RENAME COLUMN "nationality" TO "country"`);
        await queryRunner.query(`ALTER TABLE "contracts" DROP COLUMN "currency"`);
        await queryRunner.query(`COMMENT ON COLUMN "transfers"."transfer_fee" IS 'Transfer fee paid for the player'`);
        await queryRunner.query(`COMMENT ON COLUMN "transfers"."agent_fee" IS 'Agent commission fee for the transfer'`);
        await queryRunner.query(`COMMENT ON COLUMN "transfers"."annual_salary" IS 'Annual salary agreed in the transfer'`);
        await queryRunner.query(`ALTER TYPE "public"."contracts_contract_type_enum" RENAME TO "contracts_contract_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."contracts_contract_type_enum" AS ENUM('permanent', 'loan', 'youth')`);
        await queryRunner.query(`ALTER TABLE "contracts" ALTER COLUMN "contract_type" TYPE "public"."contracts_contract_type_enum" USING "contract_type"::"text"::"public"."contracts_contract_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."contracts_contract_type_enum_old"`);
        await queryRunner.query(`COMMENT ON COLUMN "contracts"."sign_on_fee" IS 'One-time signing fee paid directly to the player upon contract signing'`);
        await queryRunner.query(`COMMENT ON COLUMN "player_statistics"."rating" IS 'Match rating from 1.0 to 10.0'`);
        await queryRunner.query(`COMMENT ON COLUMN "players"."height" IS 'Height in centimeters'`);
        await queryRunner.query(`COMMENT ON COLUMN "players"."weight" IS 'Weight in kilograms'`);
        await queryRunner.query(`COMMENT ON COLUMN "players"."market_value" IS 'Current market value of the player'`);
        await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_ee6b966d5bf15c40b6dd04bb8b" ON "transfers" ("player_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_ee6b966d5bf15c40b6dd04bb8b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`COMMENT ON COLUMN "players"."market_value" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "players"."weight" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "players"."height" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "player_statistics"."rating" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "contracts"."sign_on_fee" IS 'One-time signing fee'`);
        await queryRunner.query(`CREATE TYPE "public"."contracts_contract_type_enum_old" AS ENUM('permanent', 'loan', 'trial', 'youth', 'professional')`);
        await queryRunner.query(`ALTER TABLE "contracts" ALTER COLUMN "contract_type" TYPE "public"."contracts_contract_type_enum_old" USING "contract_type"::"text"::"public"."contracts_contract_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."contracts_contract_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."contracts_contract_type_enum_old" RENAME TO "contracts_contract_type_enum"`);
        await queryRunner.query(`COMMENT ON COLUMN "transfers"."annual_salary" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "transfers"."agent_fee" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "transfers"."transfer_fee" IS NULL`);
        await queryRunner.query(`ALTER TABLE "contracts" ADD "currency" character varying(3) NOT NULL DEFAULT 'EUR'`);
        await queryRunner.query(`ALTER TABLE "players" RENAME COLUMN "country" TO "nationality"`);
        await queryRunner.query(`CREATE INDEX "IDX_9b9811b083c078840b2152cbd8" ON "players" ("position", "is_active") `);
        await queryRunner.query(`CREATE INDEX "IDX_2602554578bdc7e10db9ad5ce7" ON "players" ("nationality") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_6bf33c850e86c8eb1509bf04b6" ON "players" ("jersey_number") WHERE ((jersey_number IS NOT NULL) AND (is_active = true))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_66381ccee426b9b1c36fb5c9f2" ON "player_statistics" ("player_id", "season") `);
        await queryRunner.query(`CREATE INDEX "IDX_d08c72b23722a1d42e646f2f0c" ON "contracts" ("player_id", "status") `);
        await queryRunner.query(`CREATE INDEX "IDX_58731e4def2688e0466eeb9100" ON "contracts" ("start_date", "end_date") `);
        await queryRunner.query(`CREATE INDEX "IDX_78fd0b9f9cbfc7869ca4d9f5e3" ON "contracts" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_646d12094f9b3f688f4e189d4b" ON "contracts" ("contract_type") `);
        await queryRunner.query(`CREATE INDEX "IDX_db11685567d03c81304044fa21" ON "transfers" ("player_id", "transfer_date") `);
        await queryRunner.query(`CREATE INDEX "IDX_9ddf2a26a144b70987a76aa3d2" ON "transfers" ("transfer_type", "transfer_status") `);
        await queryRunner.query(`CREATE INDEX "IDX_321ed25dcd320a864537758f14" ON "transfers" ("from_club") `);
        await queryRunner.query(`CREATE INDEX "IDX_fc3fcf4efc5206c428a5b2e1e7" ON "transfers" ("to_club") `);
    }

}
