import { MigrationInterface, QueryRunner } from 'typeorm';

export class Sh1685050617059 implements MigrationInterface {
  name = 'Sh1685050617059';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project_user_password" DROP CONSTRAINT "PK_9768067919ed4ca54f4333413a0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_user_password" DROP COLUMN "id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_user_password" ADD CONSTRAINT "PK_e470c659df30e745fee933c5f60" PRIMARY KEY ("userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_user_password" ADD CONSTRAINT "FK_e470c659df30e745fee933c5f60" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project_user_password" DROP CONSTRAINT "FK_e470c659df30e745fee933c5f60"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_user_password" DROP CONSTRAINT "PK_e470c659df30e745fee933c5f60"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_user_password" ADD "id" BIGSERIAL NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_user_password" ADD CONSTRAINT "PK_9768067919ed4ca54f4333413a0" PRIMARY KEY ("id")`,
    );
  }
}
