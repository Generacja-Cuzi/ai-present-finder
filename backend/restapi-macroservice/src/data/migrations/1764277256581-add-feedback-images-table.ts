import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddFeedbackImagesTable1764277256581 implements MigrationInterface {
  name = "AddFeedbackImagesTable1764277256581";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "feedback_images" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "feedback_id" uuid NOT NULL, "imageData" bytea NOT NULL, "mime_type" character varying(100) NOT NULL, "file_size" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_54810ac65b7995b0b19fad6c5a7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback_images" ADD CONSTRAINT "FK_83a317528dae2b39aa028cbe2be" FOREIGN KEY ("feedback_id") REFERENCES "feedbacks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "feedback_images" DROP CONSTRAINT "FK_83a317528dae2b39aa028cbe2be"`,
    );
    await queryRunner.query(`DROP TABLE "feedback_images"`);
  }
}
