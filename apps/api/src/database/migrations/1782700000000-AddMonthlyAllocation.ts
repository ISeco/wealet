import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMonthlyAllocation1782700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "monthly_allocations" (
        "id"           UUID        NOT NULL DEFAULT gen_random_uuid(),
        "user_id"      UUID        NOT NULL,
        "month"        TEXT        NOT NULL,
        "total_amount" BIGINT      NOT NULL,
        "created_at"   TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_monthly_allocations" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_monthly_allocations_user_month" UNIQUE ("user_id", "month"),
        CONSTRAINT "FK_monthly_allocations_user"
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "transactions"
        ADD COLUMN "monthly_allocation_id" UUID,
        ADD CONSTRAINT "FK_transactions_monthly_allocation"
          FOREIGN KEY ("monthly_allocation_id")
          REFERENCES "monthly_allocations"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "transactions"
        DROP CONSTRAINT IF EXISTS "FK_transactions_monthly_allocation",
        DROP COLUMN IF EXISTS "monthly_allocation_id"
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS "monthly_allocations"`);
  }
}
