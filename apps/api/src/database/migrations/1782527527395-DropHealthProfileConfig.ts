import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropHealthProfileConfig1782527527395 implements MigrationInterface {
  name = 'DropHealthProfileConfig1782527527395';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "health_profiles" DROP COLUMN IF EXISTS "config"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "health_profiles" ADD COLUMN "config" jsonb`,
    );
  }
}
