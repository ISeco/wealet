import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBaseCurrencyToUser1783500000000 implements MigrationInterface {
  name = 'AddBaseCurrencyToUser1783500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "base_currency" char(3) NOT NULL DEFAULT 'CLP'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "base_currency"`);
  }
}
