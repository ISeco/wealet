import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFund1782163269109 implements MigrationInterface {
  name = 'CreateFund1782163269109';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."funds_classification_enum" AS ENUM('available', 'reserve', 'committed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "funds" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "name" text NOT NULL, "classification" "public"."funds_classification_enum" NOT NULL, "color" text, "is_operative" boolean NOT NULL DEFAULT false, "counts_for_runway" boolean NOT NULL DEFAULT false, "archived_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_28841455a1d360ffcfaf51c1d90" UNIQUE ("user_id", "name"), CONSTRAINT "PK_d785f4bb8f680f3febd40718f68" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_49597921a88410e4f9935e9f0b" ON "funds"  ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "funds" ADD CONSTRAINT "FK_49597921a88410e4f9935e9f0bc" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "funds" DROP CONSTRAINT "FK_49597921a88410e4f9935e9f0bc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_49597921a88410e4f9935e9f0b"`,
    );
    await queryRunner.query(`DROP TABLE "funds"`);
    await queryRunner.query(`DROP TYPE "public"."funds_classification_enum"`);
  }
}
