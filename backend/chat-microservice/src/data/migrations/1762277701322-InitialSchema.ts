import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1762277701322 implements MigrationInterface {
  name = "InitialSchema1762277701322";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "chat_sessions" ("chat_id" character varying NOT NULL, "occasion" character varying, "phase" character varying NOT NULL DEFAULT 'interview', "pending_profile_data" jsonb, "save_profile_choice" boolean, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4fa058e8b874c96f8db9ba08423" PRIMARY KEY ("chat_id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "chat_sessions"`);
  }
}
