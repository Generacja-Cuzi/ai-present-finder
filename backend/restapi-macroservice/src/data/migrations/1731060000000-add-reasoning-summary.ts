import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddReasoningSummary1731060000000 implements MigrationInterface {
  name = "AddReasoningSummary1731060000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chats" ADD "reasoning_summary" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chats" DROP COLUMN "reasoning_summary"`,
    );
  }
}
