import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorFundNameUnique1782600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop global unique constraint on (user_id, name)
    await queryRunner.query(
      `ALTER TABLE "funds" DROP CONSTRAINT IF EXISTS "UQ_28841455a1d360ffcfaf51c1d90"`,
    );

    // Unique name only for user-managed funds (no framework slot)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_funds_user_name_no_slot"
       ON "funds" ("user_id", "name")
       WHERE "framework_slot" IS NULL`,
    );

    // One fund per slot per user (framework funds)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_funds_user_slot"
       ON "funds" ("user_id", "framework_slot")
       WHERE "framework_slot" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_funds_user_name_no_slot"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_funds_user_slot"`);
    await queryRunner.query(
      `ALTER TABLE "funds" ADD CONSTRAINT "UQ_28841455a1d360ffcfaf51c1d90" UNIQUE ("user_id", "name")`,
    );
  }
}
