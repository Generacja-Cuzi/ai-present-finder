import { MigrationInterface, QueryRunner } from "typeorm";

export class GivenNameLastNamePictureColumnsUser1762372288643
  implements MigrationInterface
{
  name = "GivenNameLastNamePictureColumnsUser1762372288643";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "given_name" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "family_name" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "picture" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "picture"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "family_name"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "given_name"`);
  }
}
