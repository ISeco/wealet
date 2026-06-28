import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfitFirstFramework1782540000000 implements MigrationInterface {
  name = 'AddProfitFirstFramework1782540000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."health_profiles_framework_enum" ADD VALUE IF NOT EXISTS 'profit_first'`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL does not support DROP VALUE from an enum.
    // To roll back: recreate the enum without 'profit_first' and migrate data manually.
  }
}
