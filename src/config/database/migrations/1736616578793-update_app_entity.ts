import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAppEntity1736616578793 implements MigrationInterface {
  name = 'UpdateAppEntity1736616578793';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "app" ADD "publicId" character varying NOT NULL DEFAULT '002-' || uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "app" ADD CONSTRAINT "UQ_1d5a723cb8013eb81dea168363a" UNIQUE ("publicId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "publicId" character varying NOT NULL DEFAULT '001-' || uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_c360588ec8bbb2f67b59cfe2592" UNIQUE ("publicId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet" ALTER COLUMN "public_id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet" ALTER COLUMN "public_id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" ALTER COLUMN "reference" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wallet_transaction" ALTER COLUMN "reference" SET DEFAULT '34c0cce5-e16d-45f2-9744-c642fc20841d'`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet" ALTER COLUMN "public_id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet" ALTER COLUMN "public_id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_c360588ec8bbb2f67b59cfe2592"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "publicId"`);
    await queryRunner.query(
      `ALTER TABLE "app" DROP CONSTRAINT "UQ_1d5a723cb8013eb81dea168363a"`,
    );
    await queryRunner.query(`ALTER TABLE "app" DROP COLUMN "publicId"`);
  }
}
