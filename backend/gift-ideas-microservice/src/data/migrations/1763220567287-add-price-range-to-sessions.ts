import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPriceRangeToSessions1763220567287
  implements MigrationInterface
{
  name = "AddPriceRangeToSessions1763220567287";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chat_sessions" ADD "min_price" numeric(10,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_sessions" ADD "max_price" numeric(10,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chat_sessions" DROP COLUMN "max_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_sessions" DROP COLUMN "min_price"`,
    );
  }
}
