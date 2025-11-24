import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddRefinementFields1763749434000 implements MigrationInterface {
  name = "AddRefinementFields1763749434000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "chat_sessions" 
      ADD COLUMN "selected_listing_ids" jsonb,
      ADD COLUMN "selected_listings_context" jsonb,
      ADD COLUMN "refinement_count" integer NOT NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "chat_sessions" 
      DROP COLUMN "selected_listing_ids",
      DROP COLUMN "selected_listings_context",
      DROP COLUMN "refinement_count"
    `);
  }
}
