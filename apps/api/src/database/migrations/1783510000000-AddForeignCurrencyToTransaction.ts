import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddForeignCurrencyToTransaction1783510000000 implements MigrationInterface {
  name = 'AddForeignCurrencyToTransaction1783510000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "original_amount" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "original_currency" char(3)`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "exchange_rate" numeric(18,6)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN "exchange_rate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN "original_currency"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN "original_amount"`,
    );
  }
}
