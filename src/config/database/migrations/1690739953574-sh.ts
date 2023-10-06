import { MigrationInterface, QueryRunner } from "typeorm";

export class Sh1690739953574 implements MigrationInterface {
    name = 'Sh1690739953574'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "FK_94f168faad896c0786646fa3d4a"`);
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "FK_8afad90b6e307452eea179f0cb0"`);
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "REL_94f168faad896c0786646fa3d4"`);
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "REL_8afad90b6e307452eea179f0cb"`);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "FK_94f168faad896c0786646fa3d4a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "FK_8afad90b6e307452eea179f0cb0" FOREIGN KEY ("appId") REFERENCES "app"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "FK_8afad90b6e307452eea179f0cb0"`);
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "FK_94f168faad896c0786646fa3d4a"`);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "REL_8afad90b6e307452eea179f0cb" UNIQUE ("appId")`);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "REL_94f168faad896c0786646fa3d4" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "FK_8afad90b6e307452eea179f0cb0" FOREIGN KEY ("appId") REFERENCES "app"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "FK_94f168faad896c0786646fa3d4a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
