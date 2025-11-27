import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoundToListingsAndChats1764090710905
  implements MigrationInterface
{
  name = "AddRoundToListingsAndChats1764090710905";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chats" ADD "current_round" integer NOT NULL DEFAULT '0'`,
    );

    const hasRoundColumn: { column_name: string }[] = (await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='listings' AND column_name='round'
        `)) as { column_name: string }[];

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
