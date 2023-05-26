import { MigrationInterface, QueryRunner } from 'typeorm';

export class Sh1685051025600 implements MigrationInterface {
  name = 'Sh1685051025600';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project_user_password" DROP CONSTRAINT "FK_e470c659df30e745fee933c5f60"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_user_password" ADD CONSTRAINT "FK_e470c659df30e745fee933c5f60" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project_user_password" DROP CONSTRAINT "FK_e470c659df30e745fee933c5f60"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_user_password" ADD CONSTRAINT "FK_e470c659df30e745fee933c5f60" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
