import { MigrationInterface, QueryRunner } from 'typeorm';

export class Sh1688817899752 implements MigrationInterface {
  name = 'Sh1688817899752';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "project_app_configuration" ("id" BIGSERIAL NOT NULL, "appAuthVerificationUrl" character varying(255) NOT NULL, "appId" bigint NOT NULL, "projectId" bigint NOT NULL, CONSTRAINT "REL_2716b05fbed14660f57667ee36" UNIQUE ("appId"), CONSTRAINT "PK_e4344c5073c8488333dcde98c6a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2716b05fbed14660f57667ee36" ON "project_app_configuration" ("appId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a0e85257aabeb6a70ce3104671" ON "project_app_configuration" ("projectId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "app_user" ADD "isVerified" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "phone" character varying`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_8e1f623798118e629b46a9e6299" UNIQUE ("phone")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "email" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8e1f623798118e629b46a9e629" ON "user" ("phone") `,
    );
    await queryRunner.query(
      `ALTER TABLE "project_app_configuration" ADD CONSTRAINT "FK_a0e85257aabeb6a70ce3104671c" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_app_configuration" ADD CONSTRAINT "FK_2716b05fbed14660f57667ee368" FOREIGN KEY ("appId") REFERENCES "app"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project_app_configuration" DROP CONSTRAINT "FK_2716b05fbed14660f57667ee368"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_app_configuration" DROP CONSTRAINT "FK_a0e85257aabeb6a70ce3104671c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8e1f623798118e629b46a9e629"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "email" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_8e1f623798118e629b46a9e6299"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "phone"`);
    await queryRunner.query(`ALTER TABLE "app_user" DROP COLUMN "isVerified"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a0e85257aabeb6a70ce3104671"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2716b05fbed14660f57667ee36"`,
    );
    await queryRunner.query(`DROP TABLE "project_app_configuration"`);
  }
}
