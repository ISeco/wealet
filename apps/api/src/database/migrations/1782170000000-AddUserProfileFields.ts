import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserProfileFields1782170000000 implements MigrationInterface {
  name = 'AddUserProfileFields1782170000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "users_theme_enum" AS ENUM('light', 'dark', 'system')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "theme" "users_theme_enum" NOT NULL DEFAULT 'system'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "onboarding_completed" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "onboarding_completed_at" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "onboarding_completed_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "onboarding_completed"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "theme"`);
    await queryRunner.query(`DROP TYPE "users_theme_enum"`);
  }
}
