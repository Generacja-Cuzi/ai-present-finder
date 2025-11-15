import type { MigrationInterface, QueryRunner } from "typeorm";
import { TableColumn } from "typeorm";

export class AddPriceRangeToSessions1762278101835
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if columns already exist before adding them
    const table = await queryRunner.getTable("chat_sessions");

    const hasMinPrice = table?.columns.find(
      (column) => column.name === "min_price",
    );
    const hasMaxPrice = table?.columns.find(
      (column) => column.name === "max_price",
    );

    if (hasMinPrice === undefined) {
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
    }

    if (hasMaxPrice === undefined) {
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("chat_sessions", "max_price");
    await queryRunner.dropColumn("chat_sessions", "min_price");
  }
}
