import type { MigrationInterface, QueryRunner } from "typeorm";

export class ClearLegacyProfiles1763307860935 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "user_profiles"`);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // This migration to clear legacy profiles is not reversible
    // You can only restore from backups if needed
  }
}
