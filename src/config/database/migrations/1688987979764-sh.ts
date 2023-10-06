import { MigrationInterface, QueryRunner } from "typeorm";

export class Sh1688987979764 implements MigrationInterface {
    name = 'Sh1688987979764'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sms" ("id" BIGSERIAL NOT NULL, "content" text NOT NULL, "sender" character varying NOT NULL, "to" character varying NOT NULL, CONSTRAINT "PK_60793c2f16aafe0513f8817eae8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."project_app_configuration_appverificationtype_enum" AS ENUM('link', 'code')`);
        await queryRunner.query(`ALTER TABLE "project_app_configuration" ADD "appVerificationType" "public"."project_app_configuration_appverificationtype_enum" NOT NULL DEFAULT 'code'`);
        await queryRunner.query(`CREATE TYPE "public"."project_app_configuration_appverificationpivot_enum" AS ENUM('email', 'phone', 'authenticator_app')`);
        await queryRunner.query(`ALTER TABLE "project_app_configuration" ADD "appVerificationPivot" "public"."project_app_configuration_appverificationpivot_enum" NOT NULL DEFAULT 'email'`);
        await queryRunner.query(`ALTER TABLE "project_app_configuration" ADD "verificationTokenCount" integer NOT NULL DEFAULT '6'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project_app_configuration" DROP COLUMN "verificationTokenCount"`);
        await queryRunner.query(`ALTER TABLE "project_app_configuration" DROP COLUMN "appVerificationPivot"`);
        await queryRunner.query(`DROP TYPE "public"."project_app_configuration_appverificationpivot_enum"`);
        await queryRunner.query(`ALTER TABLE "project_app_configuration" DROP COLUMN "appVerificationType"`);
        await queryRunner.query(`DROP TYPE "public"."project_app_configuration_appverificationtype_enum"`);
        await queryRunner.query(`DROP TABLE "sms"`);
    }

}
