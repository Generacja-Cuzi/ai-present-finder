import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveOldFeedbackConstraint1764108291356
  implements MigrationInterface
{
  name = "RemoveOldFeedbackConstraint1764108291356";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove old unique constraint on chat_id only
    await queryRunner.query(
      `ALTER TABLE "feedbacks" DROP CONSTRAINT IF EXISTS "UQ_40819d53448766adc4b1339a111"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate the old constraint (only if needed for rollback)
    await queryRunner.query(
      `ALTER TABLE "feedbacks" ADD CONSTRAINT "UQ_40819d53448766adc4b1339a111" UNIQUE ("chat_id")`,
    );
  }
}
