import { MigrationInterface, QueryRunner } from "typeorm";

export class Sh1716204376284 implements MigrationInterface {
    name = 'Sh1716204376284'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "email" ADD "retryCount" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_c167ebe1bcc95be3c4232d21c70" FOREIGN KEY ("phoneCodeId") REFERENCES "phone_code"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_c167ebe1bcc95be3c4232d21c70"`);
        await queryRunner.query(`ALTER TABLE "email" DROP COLUMN "retryCount"`);
    }

}
