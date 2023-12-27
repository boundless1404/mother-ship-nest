import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserUpdate1703330312216 implements MigrationInterface {
  name = 'UserUpdate1703330312216';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "phoneCodeId" bigint`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "phoneCodeId"`);
  }
}
