import { MigrationInterface, QueryRunner } from 'typeorm';

export class Sh1734609592936 implements MigrationInterface {
  name = 'Sh1734609592936';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project_app_configuration" ADD "sharedAppTokenSecret" character varying(255)`,
    );
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `ALTER TABLE "project_app_configuration" ADD "tokenExpiry" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" ALTER COLUMN "reference" SET DEFAULT '34c0cce5-e16d-45f2-9744-c642fc20841d'`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet" ADD CONSTRAINT "UQ_7930ac6cce33d4dde0c42ca5e64" UNIQUE ("public_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet" ALTER COLUMN "public_id" SET DEFAULT uuid_generate_v4()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wallet" ALTER COLUMN "public_id" SET DEFAULT '1cece746-6387-4e36-a25a-ef6db2ab71cd'`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet" DROP CONSTRAINT "UQ_7930ac6cce33d4dde0c42ca5e64"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" ALTER COLUMN "reference" SET DEFAULT '2ff38c45-8bf9-4f29-91da-f589d824e762'`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_app_configuration" DROP COLUMN "tokenExpiry"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_app_configuration" DROP COLUMN "sharedAppTokenSecret"`,
    );
  }
}
