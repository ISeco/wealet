import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordResetToUser1783100000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN "password_reset_token"      text         NULL,
        ADD COLUMN "password_reset_expires_at" timestamptz  NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        DROP COLUMN "password_reset_token",
        DROP COLUMN "password_reset_expires_at"
    `);
  }
}
