import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGoogleAuth1783300000000 implements MigrationInterface {
  name = 'AddGoogleAuth1783300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "google_id" text`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_users_google_id" UNIQUE ("google_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "password_hash" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_users_google_id"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "google_id"`);
  }
}
