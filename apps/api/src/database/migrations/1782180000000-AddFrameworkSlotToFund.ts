import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFrameworkSlotToFund1782180000000 implements MigrationInterface {
  name = 'AddFrameworkSlotToFund1782180000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "funds" ADD COLUMN "framework_slot" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "funds" ADD COLUMN "target_percentage" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "funds" DROP COLUMN "target_percentage"`,
    );
    await queryRunner.query(`ALTER TABLE "funds" DROP COLUMN "framework_slot"`);
  }
}
