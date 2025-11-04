import type { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1762278294387 implements MigrationInterface {
  name = "InitialSchema1762278294387";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "image" text, "title" text NOT NULL, "description" text NOT NULL, "link" text NOT NULL, "price_value" double precision, "price_label" text, "price_currency" character varying(8), "price_negotiable" boolean, "category" text, "provider" character varying(50) NOT NULL DEFAULT 'unknown', "rating" integer, "reasoning" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "gift_session_product_id" uuid, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "gift_session_products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "source_event_name" character varying(128) NOT NULL, "source_event_provider" character varying(32) NOT NULL, "source_event_success" boolean NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "session_event_id" character varying, CONSTRAINT "PK_93412cb7bde00c774525def31db" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."gift_sessions_status_enum" AS ENUM('active', 'completed', 'timeout')`,
    );
    await queryRunner.query(
      `CREATE TABLE "gift_sessions" ("event_id" character varying NOT NULL, "chat_id" character varying NOT NULL, "status" "public"."gift_sessions_status_enum" NOT NULL DEFAULT 'active', "completed_events" integer NOT NULL DEFAULT '0', "total_events" integer NOT NULL, "loop_count" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "gift_context" jsonb, CONSTRAINT "PK_ef64a9636de8d39c0653398929b" PRIMARY KEY ("event_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_5800de3a7c05607fd075ef21631" FOREIGN KEY ("gift_session_product_id") REFERENCES "gift_session_products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "gift_session_products" ADD CONSTRAINT "FK_5f69f7c77b3fd75ce80926e640e" FOREIGN KEY ("session_event_id") REFERENCES "gift_sessions"("event_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gift_session_products" DROP CONSTRAINT "FK_5f69f7c77b3fd75ce80926e640e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_5800de3a7c05607fd075ef21631"`,
    );
    await queryRunner.query(`DROP TABLE "gift_sessions"`);
    await queryRunner.query(`DROP TYPE "public"."gift_sessions_status_enum"`);
    await queryRunner.query(`DROP TABLE "gift_session_products"`);
    await queryRunner.query(`DROP TABLE "products"`);
  }
}
