import { MigrationInterface, QueryRunner } from "typeorm";

export class Sh1734011380692 implements MigrationInterface {
    name = 'Sh1734011380692'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet" DROP CONSTRAINT "FK_da8a194d72a2aa3c1165e2e72ae"`);
        await queryRunner.query(`ALTER TABLE "wallet" RENAME COLUMN "wallet_owner_id" TO "wallet_owner_app_user_id"`);
        await queryRunner.query(`ALTER TABLE "wallet_transaction" ALTER COLUMN "reference" SET DEFAULT '2ff38c45-8bf9-4f29-91da-f589d824e762'`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "public_id" SET DEFAULT '1cece746-6387-4e36-a25a-ef6db2ab71cd'`);
        await queryRunner.query(`ALTER TABLE "wallet" ADD CONSTRAINT "FK_c0011b3b641e5d7951aba5768ad" FOREIGN KEY ("wallet_owner_app_user_id") REFERENCES "wallet_owner"("app_user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet" DROP CONSTRAINT "FK_c0011b3b641e5d7951aba5768ad"`);
        await queryRunner.query(`ALTER TABLE "wallet" ALTER COLUMN "public_id" SET DEFAULT '8dc0346c-8b25-4def-bf5b-2f9b3907b8e8'`);
        await queryRunner.query(`ALTER TABLE "wallet_transaction" ALTER COLUMN "reference" SET DEFAULT '7d432c8b-b216-4b44-90c7-002dd001b6f4'`);
        await queryRunner.query(`ALTER TABLE "wallet" RENAME COLUMN "wallet_owner_app_user_id" TO "wallet_owner_id"`);
        await queryRunner.query(`ALTER TABLE "wallet" ADD CONSTRAINT "FK_da8a194d72a2aa3c1165e2e72ae" FOREIGN KEY ("wallet_owner_id") REFERENCES "wallet_owner"("app_user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
