import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorTransferClubFields1736266000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create transfer_direction enum type
    await queryRunner.query(`
      CREATE TYPE "transfer_direction_enum" AS ENUM ('incoming', 'outgoing')
    `);

    // Add new columns
    await queryRunner.query(`
      ALTER TABLE "transfers" 
      ADD COLUMN "other_club_name" VARCHAR(100),
      ADD COLUMN "transfer_direction" "transfer_direction_enum"
    `);

    // Create index on transfer_direction for better query performance
    await queryRunner.query(`
      CREATE INDEX "IDX_transfer_direction" ON "transfers" ("transfer_direction")
    `);

    // Migrate existing data - for incoming transfers (signings, loan_return if fromClub exists)
    await queryRunner.query(`
      UPDATE "transfers" 
      SET 
        "other_club_name" = "from_club",
        "transfer_direction" = 'incoming'::transfer_direction_enum
      WHERE "transfer_type" IN ('signing', 'loan') 
        OR ("transfer_type" = 'loan_return' AND "from_club" IS NOT NULL)
    `);

    // Migrate existing data - for outgoing transfers (sales, releases)
    await queryRunner.query(`
      UPDATE "transfers" 
      SET 
        "other_club_name" = "to_club",
        "transfer_direction" = 'outgoing'::transfer_direction_enum
      WHERE "transfer_type" IN ('sale', 'release')
    `);

    // Handle retirements - set as outgoing with no other club
    await queryRunner.query(`
      UPDATE "transfers" 
      SET 
        "other_club_name" = NULL,
        "transfer_direction" = 'outgoing'::transfer_direction_enum
      WHERE "transfer_type" = 'retirement'
    `);

    // Make transfer_direction NOT NULL after data migration
    await queryRunner.query(`
      ALTER TABLE "transfers" 
      ALTER COLUMN "transfer_direction" SET NOT NULL
    `);

    // Add comments for documentation
    await queryRunner.query(`
      COMMENT ON COLUMN "transfers"."other_club_name" IS 'The other club involved in the transfer (not the user''s club)'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "transfers"."transfer_direction" IS 'Direction: incoming (to my club) or outgoing (from my club)'
    `);

    // Drop old columns
    await queryRunner.query(`
      ALTER TABLE "transfers" 
      DROP COLUMN "from_club",
      DROP COLUMN "to_club"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore old columns
    await queryRunner.query(`
      ALTER TABLE "transfers" 
      ADD COLUMN "from_club" VARCHAR(100),
      ADD COLUMN "to_club" VARCHAR(100)
    `);

    // Migrate data back - for incoming transfers
    await queryRunner.query(`
      UPDATE "transfers" 
      SET 
        "from_club" = "other_club_name",
        "to_club" = 'My Club'
      WHERE "transfer_direction" = 'incoming'
    `);

    // Migrate data back - for outgoing transfers
    await queryRunner.query(`
      UPDATE "transfers" 
      SET 
        "from_club" = 'My Club',
        "to_club" = COALESCE("other_club_name", 'Unknown')
      WHERE "transfer_direction" = 'outgoing'
    `);

    // Make to_club NOT NULL
    await queryRunner.query(`
      ALTER TABLE "transfers" 
      ALTER COLUMN "to_club" SET NOT NULL
    `);

    // Drop new columns and index
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_transfer_direction"
    `);

    await queryRunner.query(`
      ALTER TABLE "transfers" 
      DROP COLUMN "transfer_direction",
      DROP COLUMN "other_club_name"
    `);

    // Drop enum type
    await queryRunner.query(`
      DROP TYPE "transfer_direction_enum"
    `);
  }
}
