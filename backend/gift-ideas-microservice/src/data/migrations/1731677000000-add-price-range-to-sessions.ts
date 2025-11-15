import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddPriceRangeToSessions1731677000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "chat_sessions",
      new TableColumn({
        name: "min_price",
        type: "decimal",
        precision: 10,
        scale: 2,
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      "chat_sessions",
      new TableColumn({
        name: "max_price",
        type: "decimal",
        precision: 10,
        scale: 2,
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("chat_sessions", "max_price");
    await queryRunner.dropColumn("chat_sessions", "min_price");
  }
}
