import { MigrationInterface, QueryRunner } from "typeorm";

export class Sh1733839554196 implements MigrationInterface {
    name = 'Sh1733839554196'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."wallet_transaction_type_enum" AS ENUM('credit', 'debit')`);
        await queryRunner.query(`CREATE TYPE "public"."wallet_transaction_credit_source_type_enum" AS ENUM('wallet', 'bank', 'mobile_money', 'card')`);
        await queryRunner.query(`CREATE TABLE "wallet_transaction" ("id" BIGSERIAL NOT NULL, "type" "public"."wallet_transaction_type_enum" NOT NULL, "description" character varying NOT NULL, "reference" character varying NOT NULL DEFAULT '7d432c8b-b216-4b44-90c7-002dd001b6f4', "destination_wallet_reference" character varying NOT NULL, "source_wallet_reference" character varying, "credit_source_data" character varying, "credit_source_type" "public"."wallet_transaction_credit_source_type_enum" NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "destination_wallet_id" bigint NOT NULL, "source_wallet_id" bigint, CONSTRAINT "PK_62a01b9c3a734b96a08c621b371" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."wallet_status_enum" AS ENUM('active', 'recycled', 'inactive')`);
        await queryRunner.query(`CREATE TABLE "wallet" ("id" BIGSERIAL NOT NULL, "name" character varying, "public_id" uuid NOT NULL DEFAULT '8dc0346c-8b25-4def-bf5b-2f9b3907b8e8', "status" "public"."wallet_status_enum" NOT NULL DEFAULT 'active', "balance" numeric NOT NULL DEFAULT '0', "wallet_owner_id" bigint NOT NULL, "currencyId" bigint NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_bec464dd8d54c39c54fd32e2334" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "wallet_owner" ("app_user_id" bigint NOT NULL, "first_name" character varying, "last_name" character varying, "email" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_a1c9268d90c30800cdd1117b663" PRIMARY KEY ("app_user_id"))`);
        await queryRunner.query(`ALTER TABLE "wallet_transaction" ADD CONSTRAINT "FK_beb6c2e98df161589f75755ff5d" FOREIGN KEY ("destination_wallet_id") REFERENCES "wallet"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet_transaction" ADD CONSTRAINT "FK_cf3e0558e34b4d4936d274b3c8e" FOREIGN KEY ("source_wallet_id") REFERENCES "wallet"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet" ADD CONSTRAINT "FK_da8a194d72a2aa3c1165e2e72ae" FOREIGN KEY ("wallet_owner_id") REFERENCES "wallet_owner"("app_user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet" ADD CONSTRAINT "FK_811b584ced5705c8937beaea070" FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet_owner" ADD CONSTRAINT "FK_a1c9268d90c30800cdd1117b663" FOREIGN KEY ("app_user_id") REFERENCES "app_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet_owner" DROP CONSTRAINT "FK_a1c9268d90c30800cdd1117b663"`);
        await queryRunner.query(`ALTER TABLE "wallet" DROP CONSTRAINT "FK_811b584ced5705c8937beaea070"`);
        await queryRunner.query(`ALTER TABLE "wallet" DROP CONSTRAINT "FK_da8a194d72a2aa3c1165e2e72ae"`);
        await queryRunner.query(`ALTER TABLE "wallet_transaction" DROP CONSTRAINT "FK_cf3e0558e34b4d4936d274b3c8e"`);
        await queryRunner.query(`ALTER TABLE "wallet_transaction" DROP CONSTRAINT "FK_beb6c2e98df161589f75755ff5d"`);
        await queryRunner.query(`DROP TABLE "wallet_owner"`);
        await queryRunner.query(`DROP TABLE "wallet"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_status_enum"`);
        await queryRunner.query(`DROP TABLE "wallet_transaction"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_transaction_credit_source_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_transaction_type_enum"`);
    }

}
