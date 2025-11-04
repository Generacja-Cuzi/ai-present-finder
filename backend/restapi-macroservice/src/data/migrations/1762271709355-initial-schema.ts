import type { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1762271709355 implements MigrationInterface {
  name = "InitialSchema1762271709355";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'admin')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "google_id" character varying, "name" character varying, "access_token" text, "refresh_token" text, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_0bd5012aeb82628e07f6a1be53b" UNIQUE ("google_id"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "listings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "chat_id" character varying, "image" character varying, "title" character varying NOT NULL, "description" text NOT NULL, "link" character varying NOT NULL, "price_value" numeric(10,2), "price_label" character varying, "price_currency" character varying, "price_negotiable" boolean NOT NULL DEFAULT false, "category" character varying, "provider" character varying NOT NULL DEFAULT 'unknown', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_520ecac6c99ec90bcf5a603cdcb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d7cf2d293836a0b8ff9a546918" ON "listings" ("chat_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."messages_role_enum" AS ENUM('user', 'assistant', 'system')`,
    );
    await queryRunner.query(
      `CREATE TABLE "messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "chat_id" character varying NOT NULL, "role" "public"."messages_role_enum" NOT NULL DEFAULT 'user', "content" text NOT NULL, "proposedAnswers" json, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_366ea02dc46f24c57d225cbd79" ON "messages" ("chat_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "chats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "chat_id" character varying NOT NULL, "chat_name" character varying NOT NULL, "user_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_interview_completed" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_cb573d310bde330521e7715db2a" UNIQUE ("chat_id"), CONSTRAINT "PK_0117647b3c4a4e5ff198aeb6206" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b6c92d818d42e3e298e84d9441" ON "chats" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "feedbacks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "chat_id" character varying NOT NULL, "user_id" uuid NOT NULL, "rating" integer NOT NULL, "comment" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_40819d53448766adc4b1339a111" UNIQUE ("chat_id"), CONSTRAINT "REL_40819d53448766adc4b1339a11" UNIQUE ("chat_id"), CONSTRAINT "PK_79affc530fdd838a9f1e0cc30be" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_40819d53448766adc4b1339a11" ON "feedbacks" ("chat_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "person_name" character varying NOT NULL, "chat_id" character varying NOT NULL, "profile" jsonb NOT NULL, "key_themes" jsonb NOT NULL DEFAULT '[]', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1ec6662219f4605723f1e41b6cb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6ca9503d77ae39b4b5a6cc3ba8" ON "user_profiles" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user_favorite_listings" ("listing_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_80c9472c0001605419c3ab870a9" PRIMARY KEY ("listing_id", "user_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d396c706f07df3bbb194e98b6e" ON "user_favorite_listings" ("listing_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_542ba6e673fd64ead050990cd0" ON "user_favorite_listings" ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "listings" ADD CONSTRAINT "FK_d7cf2d293836a0b8ff9a5469182" FOREIGN KEY ("chat_id") REFERENCES "chats"("chat_id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD CONSTRAINT "FK_7540635fef1922f0b156b9ef74f" FOREIGN KEY ("chat_id") REFERENCES "chats"("chat_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chats" ADD CONSTRAINT "FK_b6c92d818d42e3e298e84d94414" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedbacks" ADD CONSTRAINT "FK_40819d53448766adc4b1339a111" FOREIGN KEY ("chat_id") REFERENCES "chats"("chat_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedbacks" ADD CONSTRAINT "FK_4334f6be2d7d841a9d5205a100e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" ADD CONSTRAINT "FK_6ca9503d77ae39b4b5a6cc3ba88" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_favorite_listings" ADD CONSTRAINT "FK_d396c706f07df3bbb194e98b6e5" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_favorite_listings" ADD CONSTRAINT "FK_542ba6e673fd64ead050990cd06" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_favorite_listings" DROP CONSTRAINT "FK_542ba6e673fd64ead050990cd06"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_favorite_listings" DROP CONSTRAINT "FK_d396c706f07df3bbb194e98b6e5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_profiles" DROP CONSTRAINT "FK_6ca9503d77ae39b4b5a6cc3ba88"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedbacks" DROP CONSTRAINT "FK_4334f6be2d7d841a9d5205a100e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedbacks" DROP CONSTRAINT "FK_40819d53448766adc4b1339a111"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chats" DROP CONSTRAINT "FK_b6c92d818d42e3e298e84d94414"`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_7540635fef1922f0b156b9ef74f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "listings" DROP CONSTRAINT "FK_d7cf2d293836a0b8ff9a5469182"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_542ba6e673fd64ead050990cd0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d396c706f07df3bbb194e98b6e"`,
    );
    await queryRunner.query(`DROP TABLE "user_favorite_listings"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6ca9503d77ae39b4b5a6cc3ba8"`,
    );
    await queryRunner.query(`DROP TABLE "user_profiles"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_40819d53448766adc4b1339a11"`,
    );
    await queryRunner.query(`DROP TABLE "feedbacks"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b6c92d818d42e3e298e84d9441"`,
    );
    await queryRunner.query(`DROP TABLE "chats"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_366ea02dc46f24c57d225cbd79"`,
    );
    await queryRunner.query(`DROP TABLE "messages"`);
    await queryRunner.query(`DROP TYPE "public"."messages_role_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d7cf2d293836a0b8ff9a546918"`,
    );
    await queryRunner.query(`DROP TABLE "listings"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
