import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHealthProfile1782163441812 implements MigrationInterface {
  name = 'CreateHealthProfile1782163441812';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."health_profiles_framework_enum" AS ENUM('50_30_20', 'jars_eker', 'fondos')`,
    );
    await queryRunner.query(
      `CREATE TABLE "health_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "framework" "public"."health_profiles_framework_enum" NOT NULL DEFAULT 'fondos', "monthly_income" bigint, "config" jsonb, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_e714b9317bf217a0838a56fd7f4" UNIQUE ("user_id"), CONSTRAINT "PK_bfcb0de64c3eaf755e66ebb2211" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "health_profiles" ADD CONSTRAINT "FK_e714b9317bf217a0838a56fd7f4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "health_profiles" DROP CONSTRAINT "FK_e714b9317bf217a0838a56fd7f4"`,
    );
    await queryRunner.query(`DROP TABLE "health_profiles"`);
    await queryRunner.query(
      `DROP TYPE "public"."health_profiles_framework_enum"`,
    );
  }
}
