import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddChatStatus1763755664257 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type
    await queryRunner.query(`
      CREATE TYPE "chats_status_enum" AS ENUM('interview', 'searching', 'completed')
    `);

    // Add status column with default 'interview'
    await queryRunner.query(`
      ALTER TABLE "chats"
      ADD COLUMN "status" "chats_status_enum" NOT NULL DEFAULT 'interview'
    `);

    // Set status based on current state
    await queryRunner.query(`
      UPDATE "chats"
      SET "status" = CASE
        WHEN "is_interview_completed" = false THEN 'interview'::chats_status_enum
        WHEN EXISTS (SELECT 1 FROM "listings" WHERE "listings"."chat_id" = "chats"."chat_id") THEN 'completed'::chats_status_enum
        ELSE 'searching'::chats_status_enum
      END
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove status column
    await queryRunner.query(`
      ALTER TABLE "chats" DROP COLUMN "status"
    `);

    // Drop enum type
    await queryRunner.query(`
      DROP TYPE "chats_status_enum"
    `);
  }
}
