import { MigrationInterface, QueryRunner } from "typeorm";

export class Sh1685840309435 implements MigrationInterface {
    name = 'Sh1685840309435'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."email_priority_enum" AS ENUM('immediate', 'regular', 'delayed')`);
        await queryRunner.query(`CREATE TABLE "email" ("id" BIGSERIAL NOT NULL, "priority" "public"."email_priority_enum" NOT NULL DEFAULT 'regular', "attachmentFileUrls" jsonb, "body" json NOT NULL, "sendAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_1e7ed8734ee054ef18002e29b1c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "app" ADD CONSTRAINT "UQ_f36adbb7b096ceeb6f3e80ad14c" UNIQUE ("name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "app" DROP CONSTRAINT "UQ_f36adbb7b096ceeb6f3e80ad14c"`);
        await queryRunner.query(`DROP TABLE "email"`);
        await queryRunner.query(`DROP TYPE "public"."email_priority_enum"`);
    }

}
