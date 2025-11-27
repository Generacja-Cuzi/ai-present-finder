import type { MigrationInterface, QueryRunner } from "typeorm";

export class RenameImagedataColumn1764277445671 implements MigrationInterface {
  name = "RenameImagedataColumn1764277445671";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "feedback_images" RENAME COLUMN "imageData" TO "image_data"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "feedback_images" RENAME COLUMN "image_data" TO "imageData"`,
    );
  }
}
