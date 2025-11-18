import type { MigrationInterface, QueryRunner } from "typeorm";

export class RecreateJsonColumn1763307860934 implements MigrationInterface {
  // this clears all profile info from chats, but dropping and adding the column
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chats" DROP COLUMN "reasoning_summary"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chats" ADD "reasoning_summary" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // this is not really reversible action
    await queryRunner.query(
      `ALTER TABLE "chats" DROP COLUMN "reasoning_summary"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chats" ADD "reasoning_summary" jsonb`,
    );
  }
}
