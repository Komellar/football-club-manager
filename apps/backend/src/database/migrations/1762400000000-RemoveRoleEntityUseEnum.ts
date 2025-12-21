import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveRoleEntityUseEnum1762400000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM ('admin', 'user')
    `);

    // Add new role column with enum type
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "role" "user_role_enum" NOT NULL DEFAULT 'user'
    `);

    // Migrate existing data from role_id to role enum
    await queryRunner.query(`
      UPDATE "users" 
      SET "role" = CASE 
        WHEN EXISTS (
          SELECT 1 FROM "roles" 
          WHERE "roles"."id" = "users"."role_id" 
          AND "roles"."name" = 'admin'
        ) THEN 'admin'::user_role_enum
        ELSE 'user'::user_role_enum
      END
    `);

    // Drop the foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP CONSTRAINT IF EXISTS "FK_368e146b785b574f42ae9e53d5e"
    `);

    // Drop the role_id column
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN "role_id"
    `);

    // Drop the roles table
    await queryRunner.query(`DROP TABLE IF EXISTS "roles"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate roles table
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" SERIAL PRIMARY KEY,
        "name" character varying NOT NULL UNIQUE
      )
    `);

    // Insert default roles
    await queryRunner.query(`
      INSERT INTO "roles" ("name") VALUES ('admin'), ('user')
    `);

    // Add role_id column back
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "role_id" integer
    `);

    // Migrate data back from enum to role_id
    await queryRunner.query(`
      UPDATE "users" 
      SET "role_id" = (
        SELECT "id" FROM "roles" 
        WHERE "roles"."name" = "users"."role"::text
      )
    `);

    // Make role_id NOT NULL after data migration
    await queryRunner.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "role_id" SET NOT NULL
    `);

    // Recreate foreign key
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD CONSTRAINT "FK_368e146b785b574f42ae9e53d5e" 
      FOREIGN KEY ("role_id") REFERENCES "roles"("id")
    `);

    // Drop role column and enum type
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN "role"
    `);

    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}
