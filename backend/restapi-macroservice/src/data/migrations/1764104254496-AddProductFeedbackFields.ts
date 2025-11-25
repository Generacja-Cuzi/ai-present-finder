import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductFeedbackFields1764104254496
  implements MigrationInterface
{
  name = "AddProductFeedbackFields1764104254496";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_40819d53448766adc4b1339a11"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedbacks" ADD "product_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedbacks" ADD "is_general_feedback" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_bc249e7e802ebc065b4e89827e" ON "feedbacks" ("chat_id", "product_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bc249e7e802ebc065b4e89827e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedbacks" DROP COLUMN "is_general_feedback"`,
    );
    await queryRunner.query(`ALTER TABLE "feedbacks" DROP COLUMN "product_id"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_40819d53448766adc4b1339a11" ON "feedbacks" ("chat_id") `,
    );
  }
}
