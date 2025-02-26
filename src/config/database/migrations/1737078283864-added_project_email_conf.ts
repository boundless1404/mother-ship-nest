import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedProjectEmailConf1737078283864 implements MigrationInterface {
    name = 'AddedProjectEmailConf1737078283864'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."project_conf_email_detail_type_enum" AS ENUM('verification', 'password_reset')`);
        await queryRunner.query(`CREATE TABLE "project_conf_email_detail" ("id" BIGSERIAL NOT NULL, "name" character varying(255), "type" "public"."project_conf_email_detail_type_enum" NOT NULL, "emailSenderName" character varying NOT NULL, "emailSenderAddress" character varying NOT NULL, "emailSubject" character varying NOT NULL, "emailBodyTemplate" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "projectAppConfigurationId" bigint NOT NULL, CONSTRAINT "PK_9317202018d4b1bd21d5177d84e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "publicId" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "app" ALTER COLUMN "publicId" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "public_id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "public_id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "project_conf_email_detail" ADD CONSTRAINT "FK_fc1d51293d123084b04414c20d1" FOREIGN KEY ("projectAppConfigurationId") REFERENCES "project_app_configuration"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project_conf_email_detail" DROP CONSTRAINT "FK_fc1d51293d123084b04414c20d1"`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "public_id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "public_id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "app" ALTER COLUMN "publicId" SET DEFAULT ('002-'|| uuid_generate_v4())`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "publicId" SET DEFAULT ('001-'|| uuid_generate_v4())`);
        await queryRunner.query(`DROP TABLE "project_conf_email_detail"`);
        await queryRunner.query(`DROP TYPE "public"."project_conf_email_detail_type_enum"`);
    }

}
