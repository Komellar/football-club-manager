import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1759501210907 implements MigrationInterface {
  name = 'InitialSchema1759501210907';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."roles_name_enum" AS ENUM('admin', 'user')`,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" SERIAL NOT NULL, "name" "public"."roles_name_enum" NOT NULL, CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "email" character varying(100) NOT NULL, "password_hash" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "role_id" integer, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."contracts_contract_type_enum" AS ENUM('permanent', 'loan', 'trial', 'youth', 'professional')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."contracts_status_enum" AS ENUM('active', 'expired', 'terminated', 'pending')`,
    );
    await queryRunner.query(
      `CREATE TABLE "contracts" ("id" SERIAL NOT NULL, "player_id" integer NOT NULL, "contract_type" "public"."contracts_contract_type_enum" NOT NULL, "status" "public"."contracts_status_enum" NOT NULL DEFAULT 'pending', "start_date" date NOT NULL, "end_date" date NOT NULL, "salary" numeric(12,2) NOT NULL, "currency" character varying(3) NOT NULL DEFAULT 'EUR', "bonuses" numeric(12,2), "sign_on_fee" numeric(12,2), "release_clause" numeric(12,2), "agent_fee" numeric(12,2), "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2c7b8f3a7b1acdd49497d83d0fb" PRIMARY KEY ("id")); COMMENT ON COLUMN "contracts"."salary" IS 'Monthly salary in the specified currency'; COMMENT ON COLUMN "contracts"."bonuses" IS 'Performance and achievement bonuses'; COMMENT ON COLUMN "contracts"."sign_on_fee" IS 'One-time signing fee'; COMMENT ON COLUMN "contracts"."release_clause" IS 'Contract release clause amount'; COMMENT ON COLUMN "contracts"."agent_fee" IS 'Agent commission fee'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e4233d576b793b65c012815506" ON "contracts" ("player_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_646d12094f9b3f688f4e189d4b" ON "contracts" ("contract_type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_78fd0b9f9cbfc7869ca4d9f5e3" ON "contracts" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_58731e4def2688e0466eeb9100" ON "contracts" ("start_date", "end_date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d08c72b23722a1d42e646f2f0c" ON "contracts" ("player_id", "status") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."players_position_enum" AS ENUM('goalkeeper', 'defender', 'midfielder', 'forward')`,
    );
    await queryRunner.query(
      `CREATE TABLE "players" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "position" "public"."players_position_enum" NOT NULL, "date_of_birth" date NOT NULL, "nationality" character varying(50) NOT NULL, "height" integer, "weight" numeric(5,2), "jersey_number" integer, "market_value" numeric(12,2), "is_active" boolean NOT NULL DEFAULT true, "image_url" character varying(255), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_de22b8fdeee0c33ab55ae71da3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1b597c8eb2fadb72240d576fd0" ON "players" ("name") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_6bf33c850e86c8eb1509bf04b6" ON "players" ("jersey_number") WHERE jersey_number IS NOT NULL AND is_active = true`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2602554578bdc7e10db9ad5ce7" ON "players" ("nationality") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9b9811b083c078840b2152cbd8" ON "players" ("position", "is_active") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transfers_transfer_type_enum" AS ENUM('signing', 'loan', 'loan_return', 'sale', 'release', 'retirement')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transfers_transfer_status_enum" AS ENUM('pending', 'completed', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "transfers" ("id" SERIAL NOT NULL, "player_id" integer NOT NULL, "from_club" character varying(100), "to_club" character varying(100) NOT NULL, "transfer_type" "public"."transfers_transfer_type_enum" NOT NULL, "transfer_status" "public"."transfers_transfer_status_enum" NOT NULL DEFAULT 'pending', "transfer_date" date NOT NULL, "transfer_fee" numeric(12,2), "agent_fee" numeric(10,2), "annual_salary" numeric(10,2), "contract_length_months" integer, "loan_end_date" date, "notes" text, "is_permanent" boolean NOT NULL DEFAULT false, "created_by" character varying(100), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f712e908b465e0085b4408cabc3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fc3fcf4efc5206c428a5b2e1e7" ON "transfers" ("to_club") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_321ed25dcd320a864537758f14" ON "transfers" ("from_club") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9ddf2a26a144b70987a76aa3d2" ON "transfers" ("transfer_type", "transfer_status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_db11685567d03c81304044fa21" ON "transfers" ("player_id", "transfer_date") `,
    );
    await queryRunner.query(
      `CREATE TABLE "player_statistics" ("id" SERIAL NOT NULL, "player_id" integer NOT NULL, "season" character varying(9) NOT NULL, "matches_played" integer NOT NULL DEFAULT '0', "minutes_played" integer NOT NULL DEFAULT '0', "goals" integer NOT NULL DEFAULT '0', "assists" integer NOT NULL DEFAULT '0', "yellow_cards" integer NOT NULL DEFAULT '0', "red_cards" integer NOT NULL DEFAULT '0', "clean_sheets" integer NOT NULL DEFAULT '0', "saves_made" integer NOT NULL DEFAULT '0', "rating" numeric(3,1), "average_rating" numeric(3,1), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ecddc0ee7164ae08d783e51b7c8" PRIMARY KEY ("id")); COMMENT ON COLUMN "player_statistics"."season" IS 'Format: 2023-2024'; COMMENT ON COLUMN "player_statistics"."average_rating" IS 'Average rating from 1.0 to 10.0 (e.g., 6.8)'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_66381ccee426b9b1c36fb5c9f2" ON "player_statistics" ("player_id", "season") `,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" ADD CONSTRAINT "FK_e4233d576b793b65c0128155060" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfers" ADD CONSTRAINT "FK_ee6b966d5bf15c40b6dd04bb8be" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "player_statistics" ADD CONSTRAINT "FK_003e20673dcc4dae562c38c1dd7" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "player_statistics" DROP CONSTRAINT "FK_003e20673dcc4dae562c38c1dd7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfers" DROP CONSTRAINT "FK_ee6b966d5bf15c40b6dd04bb8be"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" DROP CONSTRAINT "FK_e4233d576b793b65c0128155060"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_66381ccee426b9b1c36fb5c9f2"`,
    );
    await queryRunner.query(`DROP TABLE "player_statistics"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_db11685567d03c81304044fa21"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9ddf2a26a144b70987a76aa3d2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_321ed25dcd320a864537758f14"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fc3fcf4efc5206c428a5b2e1e7"`,
    );
    await queryRunner.query(`DROP TABLE "transfers"`);
    await queryRunner.query(
      `DROP TYPE "public"."transfers_transfer_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."transfers_transfer_type_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9b9811b083c078840b2152cbd8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2602554578bdc7e10db9ad5ce7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6bf33c850e86c8eb1509bf04b6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1b597c8eb2fadb72240d576fd0"`,
    );
    await queryRunner.query(`DROP TABLE "players"`);
    await queryRunner.query(`DROP TYPE "public"."players_position_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d08c72b23722a1d42e646f2f0c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_58731e4def2688e0466eeb9100"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_78fd0b9f9cbfc7869ca4d9f5e3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_646d12094f9b3f688f4e189d4b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e4233d576b793b65c012815506"`,
    );
    await queryRunner.query(`DROP TABLE "contracts"`);
    await queryRunner.query(`DROP TYPE "public"."contracts_status_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."contracts_contract_type_enum"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TYPE "public"."roles_name_enum"`);
  }
}
