import { MigrationInterface, QueryRunner } from "typeorm";

export class FirstMigrations1684575452998 implements MigrationInterface {
    name = 'FirstMigrations1684575452998'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "project" ("id" BIGSERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "project_user_password" ("id" BIGSERIAL NOT NULL, "password" character varying NOT NULL, "userId" bigint NOT NULL, CONSTRAINT "PK_9768067919ed4ca54f4333413a0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" BIGSERIAL NOT NULL, "firstName" character varying NOT NULL DEFAULT '', "middleName" character varying NOT NULL DEFAULT '', "lastName" character varying NOT NULL DEFAULT '', "email" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_58e4dbff0e1a32a9bdc861bb29" ON "user" ("firstName") `);
        await queryRunner.query(`CREATE INDEX "IDX_f0e1b4ecdca13b177e2e3a0613" ON "user" ("lastName") `);
        await queryRunner.query(`CREATE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `);
        await queryRunner.query(`CREATE TABLE "project_user" ("id" BIGSERIAL NOT NULL, "isProjectCreator" boolean, "isAdmin" boolean NOT NULL, "userId" bigint NOT NULL, "projectId" bigint NOT NULL, CONSTRAINT "PK_1cf56b10b23971cfd07e4fc6126" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."token_purpose_enum" AS ENUM('sign_up', 'reset_password', 'access_token', 'invitation_token', 'single_sign_in')`);
        await queryRunner.query(`CREATE TABLE "token" ("id" BIGSERIAL NOT NULL, "valueOfToken" character varying NOT NULL, "expiry" numeric NOT NULL, "purpose" "public"."token_purpose_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "projectUserId" bigint, "appUserId" bigint, "userId" bigint, "appId" bigint, CONSTRAINT "REL_94f168faad896c0786646fa3d4" UNIQUE ("userId"), CONSTRAINT "REL_8afad90b6e307452eea179f0cb" UNIQUE ("appId"), CONSTRAINT "PK_82fae97f905930df5d62a702fc9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "app_user" ("id" BIGSERIAL NOT NULL, "password" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "appId" bigint NOT NULL, "userId" bigint NOT NULL, CONSTRAINT "PK_22a5c4a3d9b2fb8e4e73fc4ada1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "app" ("id" BIGSERIAL NOT NULL, "name" character varying(255) NOT NULL, "requireIdentityValidation" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "projectId" bigint NOT NULL, CONSTRAINT "PK_9478629fc093d229df09e560aea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "file" ("id" BIGSERIAL NOT NULL, "forEntity" character varying, "entityRecordId" bigint, "addedByEntity" character varying, "addedByEntityId" bigint, "fileName" character varying NOT NULL, "fileExtension" character varying NOT NULL, "fileUniqueKey" character varying NOT NULL, "fileSize" numeric(10,2) NOT NULL, "filePurpose" character varying, "fileServerStatus" character varying, "serverGeneratedFileUploadId" character varying, "ownerProfileCollectionId" bigint, "otherFileDetails" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_36b46d232307066b3a2c9ea3a1" ON "file" ("id") `);
        await queryRunner.query(`CREATE INDEX "IDX_825a0ba5887198f9e109c51fa9" ON "file" ("forEntity") `);
        await queryRunner.query(`CREATE INDEX "IDX_8a28d95586203fde9abdc5ed98" ON "file" ("entityRecordId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b4a20d7b9bb0ac33a813a4091b" ON "file" ("addedByEntity") `);
        await queryRunner.query(`CREATE INDEX "IDX_5f728571485f1c3242046033c4" ON "file" ("addedByEntityId") `);
        await queryRunner.query(`CREATE INDEX "IDX_8b057c719c6bec9402895e992d" ON "file" ("fileUniqueKey") `);
        await queryRunner.query(`CREATE INDEX "IDX_13de5479837fc0f4ea1a5f23f2" ON "file" ("fileSize") `);
        await queryRunner.query(`CREATE INDEX "IDX_b99597d0502727168be8ee7a63" ON "file" ("filePurpose") `);
        await queryRunner.query(`CREATE INDEX "IDX_c40243b30b30087fc0cef9c236" ON "file" ("fileServerStatus") `);
        await queryRunner.query(`CREATE INDEX "IDX_bce35b64b7eab1247fecc1bc17" ON "file" ("serverGeneratedFileUploadId") `);
        await queryRunner.query(`CREATE INDEX "IDX_df4814322f07b73645ce047a92" ON "file" ("ownerProfileCollectionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_18a0ad156828b598fcef570209" ON "file" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_d336bee718f4b96da84e8a2b1c" ON "file" ("updatedAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_335685f380a445ccd86ca2c1d6" ON "file" ("deletedAt") `);
        await queryRunner.query(`ALTER TABLE "project_user" ADD CONSTRAINT "FK_8d75193a81f827ba8d58575e637" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "project_user" ADD CONSTRAINT "FK_be4e7ad73afd703f94b8866eb6b" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "FK_96a7f95390cb776160dd97502c0" FOREIGN KEY ("appUserId") REFERENCES "app_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "FK_d6b4fd637bdbc213ab5b2cd0d0a" FOREIGN KEY ("projectUserId") REFERENCES "project_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "FK_94f168faad896c0786646fa3d4a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "FK_8afad90b6e307452eea179f0cb0" FOREIGN KEY ("appId") REFERENCES "app"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "app_user" ADD CONSTRAINT "FK_ab2b6c1ca6939c84cedf0c83b8c" FOREIGN KEY ("appId") REFERENCES "app"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "app_user" ADD CONSTRAINT "FK_6ea20ce66257c9bfb9f6690d8d1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "app_user" DROP CONSTRAINT "FK_6ea20ce66257c9bfb9f6690d8d1"`);
        await queryRunner.query(`ALTER TABLE "app_user" DROP CONSTRAINT "FK_ab2b6c1ca6939c84cedf0c83b8c"`);
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "FK_8afad90b6e307452eea179f0cb0"`);
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "FK_94f168faad896c0786646fa3d4a"`);
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "FK_d6b4fd637bdbc213ab5b2cd0d0a"`);
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "FK_96a7f95390cb776160dd97502c0"`);
        await queryRunner.query(`ALTER TABLE "project_user" DROP CONSTRAINT "FK_be4e7ad73afd703f94b8866eb6b"`);
        await queryRunner.query(`ALTER TABLE "project_user" DROP CONSTRAINT "FK_8d75193a81f827ba8d58575e637"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_335685f380a445ccd86ca2c1d6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d336bee718f4b96da84e8a2b1c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_18a0ad156828b598fcef570209"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_df4814322f07b73645ce047a92"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bce35b64b7eab1247fecc1bc17"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c40243b30b30087fc0cef9c236"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b99597d0502727168be8ee7a63"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_13de5479837fc0f4ea1a5f23f2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8b057c719c6bec9402895e992d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5f728571485f1c3242046033c4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b4a20d7b9bb0ac33a813a4091b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8a28d95586203fde9abdc5ed98"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_825a0ba5887198f9e109c51fa9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_36b46d232307066b3a2c9ea3a1"`);
        await queryRunner.query(`DROP TABLE "file"`);
        await queryRunner.query(`DROP TABLE "app"`);
        await queryRunner.query(`DROP TABLE "app_user"`);
        await queryRunner.query(`DROP TABLE "token"`);
        await queryRunner.query(`DROP TYPE "public"."token_purpose_enum"`);
        await queryRunner.query(`DROP TABLE "project_user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f0e1b4ecdca13b177e2e3a0613"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_58e4dbff0e1a32a9bdc861bb29"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "project_user_password"`);
        await queryRunner.query(`DROP TABLE "project"`);
    }

}
