import { MigrationInterface, QueryRunner } from 'typeorm';

export class Sh1703325459392 implements MigrationInterface {
  name = 'Sh1703325459392';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "phone_code" ("id" BIGSERIAL NOT NULL, "name" character varying NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "countryId" bigint NOT NULL, CONSTRAINT "PK_63535b596f66607b3da0ead52e4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "currency" ("id" BIGSERIAL NOT NULL, "name" character varying NOT NULL, "fullname" character varying, "symbol" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "countryId" bigint NOT NULL, CONSTRAINT "PK_3cda65c731a6264f0e444cc9b91" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "country" ("id" BIGSERIAL NOT NULL, "name" character varying NOT NULL, "fullname" character varying NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_bf6e37c231c4f4ea56dcd887269" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "phone_code" ADD CONSTRAINT "FK_62d3c2889dcb44ef26531d68dbf" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "currency" ADD CONSTRAINT "FK_f06fe84c2edce16808c79cf9f8e" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE TABLE "typeorm_cache_table" ("id" SERIAL NOT NULL, "identifier" character varying, "time" bigint NOT NULL, "duration" integer NOT NULL, "query" text NOT NULL, "result" text NOT NULL, CONSTRAINT "PK_1f1c066da68820c20a4ff873df1" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "typeorm_cache_table"`);
    await queryRunner.query(
      `ALTER TABLE "currency" DROP CONSTRAINT "FK_f06fe84c2edce16808c79cf9f8e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "phone_code" DROP CONSTRAINT "FK_62d3c2889dcb44ef26531d68dbf"`,
    );
    await queryRunner.query(`DROP TABLE "country"`);
    await queryRunner.query(`DROP TABLE "currency"`);
    await queryRunner.query(`DROP TABLE "phone_code"`);
  }
}
