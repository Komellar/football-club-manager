import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1771185096793 implements MigrationInterface {
    name = 'Migrations1771185096793'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_transfer_direction"`);
        await queryRunner.query(`CREATE TYPE "public"."sponsorships_sponsorship_type_enum" AS ENUM('kit_sponsor', 'stadium_naming', 'training_kit', 'sleeve_sponsor', 'regional_partner', 'official_partner', 'technical_sponsor')`);
        await queryRunner.query(`CREATE TYPE "public"."sponsorships_sponsorship_status_enum" AS ENUM('active', 'pending', 'expired', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "sponsorships" ("id" SERIAL NOT NULL, "sponsor_name" character varying(100) NOT NULL, "sponsorship_type" "public"."sponsorships_sponsorship_type_enum" NOT NULL, "sponsorship_status" "public"."sponsorships_sponsorship_status_enum" NOT NULL DEFAULT 'active', "start_date" date NOT NULL, "end_date" date NOT NULL, "annual_value" numeric(12,2) NOT NULL, "payment_frequency" character varying(20) NOT NULL DEFAULT 'annually', "description" text, "contact_person" character varying(100), "contact_email" character varying(100), "contact_phone" character varying(20), "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_393571b62d6dd0f63c6d3eb154b" PRIMARY KEY ("id")); COMMENT ON COLUMN "sponsorships"."annual_value" IS 'Annual sponsorship value'`);
        await queryRunner.query(`CREATE INDEX "IDX_67ecf24d619485ff43b9bd73aa" ON "sponsorships" ("sponsor_name") `);
        await queryRunner.query(`CREATE INDEX "IDX_9d1153de831787e09fa0525014" ON "sponsorships" ("sponsorship_type") `);
        await queryRunner.query(`CREATE INDEX "IDX_ef8fef822e23d9d7643b726fab" ON "sponsorships" ("sponsorship_status") `);
        await queryRunner.query(`CREATE INDEX "IDX_cb7ec6ea5012f3dfa9f2eefdc1" ON "sponsorships" ("start_date") `);
        await queryRunner.query(`CREATE INDEX "IDX_11ad4dae34b1f64735e7bd7eae" ON "sponsorships" ("end_date") `);
        await queryRunner.query(`COMMENT ON COLUMN "transfers"."other_club_name" IS 'The other club involved in the transfer (not the users club)'`);
        await queryRunner.query(`ALTER TYPE "public"."transfer_direction_enum" RENAME TO "transfer_direction_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."transfers_transfer_direction_enum" AS ENUM('incoming', 'outgoing')`);
        await queryRunner.query(`ALTER TABLE "transfers" ALTER COLUMN "transfer_direction" TYPE "public"."transfers_transfer_direction_enum" USING "transfer_direction"::"text"::"public"."transfers_transfer_direction_enum"`);
        await queryRunner.query(`DROP TYPE "public"."transfer_direction_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum" RENAME TO "user_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'user')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::"text"::"public"."users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user'`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum_old"`);
        await queryRunner.query(`CREATE INDEX "IDX_8c6b9bdc2bcbb9401f901073d7" ON "transfers" ("transfer_direction") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_8c6b9bdc2bcbb9401f901073d7"`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum_old" AS ENUM('admin', 'user')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."user_role_enum_old" USING "role"::"text"::"public"."user_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user'`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_role_enum_old" RENAME TO "user_role_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."transfer_direction_enum_old" AS ENUM('incoming', 'outgoing')`);
        await queryRunner.query(`ALTER TABLE "transfers" ALTER COLUMN "transfer_direction" TYPE "public"."transfer_direction_enum_old" USING "transfer_direction"::"text"::"public"."transfer_direction_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."transfers_transfer_direction_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."transfer_direction_enum_old" RENAME TO "transfer_direction_enum"`);
        await queryRunner.query(`COMMENT ON COLUMN "transfers"."other_club_name" IS 'The other club involved in the transfer (not the user''s club)'`);
        await queryRunner.query(`DROP INDEX "public"."IDX_11ad4dae34b1f64735e7bd7eae"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cb7ec6ea5012f3dfa9f2eefdc1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ef8fef822e23d9d7643b726fab"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9d1153de831787e09fa0525014"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_67ecf24d619485ff43b9bd73aa"`);
        await queryRunner.query(`DROP TABLE "sponsorships"`);
        await queryRunner.query(`DROP TYPE "public"."sponsorships_sponsorship_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."sponsorships_sponsorship_type_enum"`);
        await queryRunner.query(`CREATE INDEX "IDX_transfer_direction" ON "transfers" ("transfer_direction") `);
    }

}
