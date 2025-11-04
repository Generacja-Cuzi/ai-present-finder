import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1762278101834 implements MigrationInterface {
  name = "InitialSchema1762278101834";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."chat_sessions_stalking_status_enum" AS ENUM('in_progress', 'completed', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."chat_sessions_interview_status_enum" AS ENUM('in_progress', 'completed', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "chat_sessions" ("chat_id" character varying NOT NULL, "stalking_status" "public"."chat_sessions_stalking_status_enum" NOT NULL DEFAULT 'in_progress', "interview_status" "public"."chat_sessions_interview_status_enum" NOT NULL DEFAULT 'in_progress', "stalking_keywords" jsonb, "interview_profile" jsonb, "interview_keywords" jsonb, "gift_generation_triggered" boolean NOT NULL DEFAULT false, "save_profile" boolean, "profile_name" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4fa058e8b874c96f8db9ba08423" PRIMARY KEY ("chat_id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "chat_sessions"`);
    await queryRunner.query(
      `DROP TYPE "public"."chat_sessions_interview_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."chat_sessions_stalking_status_enum"`,
    );
  }
}
