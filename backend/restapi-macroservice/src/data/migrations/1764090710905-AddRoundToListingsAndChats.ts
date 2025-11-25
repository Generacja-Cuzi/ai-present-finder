import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoundToListingsAndChats1764090710905
  implements MigrationInterface
{
  name = "AddRoundToListingsAndChats1764090710905";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chats" ADD "current_round" integer NOT NULL DEFAULT '0'`,
    );

    const hasRoundColumn = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='listings' AND column_name='round'
        `);

    if (hasRoundColumn.length === 0) {
      await queryRunner.query(
        `ALTER TABLE "listings" ADD "round" integer NOT NULL DEFAULT '1'`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "listings" DROP COLUMN IF EXISTS "round"`,
    );
    await queryRunner.query(`ALTER TABLE "chats" DROP COLUMN "current_round"`);
  }
}
