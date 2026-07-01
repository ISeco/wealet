import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTransaction1782163339673 implements MigrationInterface {
  name = 'CreateTransaction1782163339673';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_type_enum" AS ENUM('income', 'expense')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_source_enum" AS ENUM('manual', 'import')`,
    );
    await queryRunner.query(
      `CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "fund_id" uuid NOT NULL, "category_id" uuid NOT NULL, "type" "public"."transactions_type_enum" NOT NULL, "amount" bigint NOT NULL, "currency" character(3) NOT NULL DEFAULT 'CLP', "description" text, "occurred_on" date NOT NULL, "dedupe_hash" text, "source" "public"."transactions_source_enum" NOT NULL DEFAULT 'manual', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e9acc6efa76de013e8c1553ed2" ON "transactions"  ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5d5caaa3ab51a790c1404a0d77" ON "transactions"  ("fund_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8594f3deff3fda747008f489c3" ON "transactions"  ("occurred_on") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6c954e073341951a7cfeaf9c46" ON "transactions"  ("user_id", "fund_id", "occurred_on") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3b8e40efad79f3ff19b4c87c89" ON "transactions"  ("user_id", "occurred_on") `,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_e9acc6efa76de013e8c1553ed2b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_5d5caaa3ab51a790c1404a0d77e" FOREIGN KEY ("fund_id") REFERENCES "funds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_c9e41213ca42d50132ed7ab2b0f" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "CHK_transactions_amount_non_negative" CHECK ("amount" >= 0)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_transactions_user_dedupe_hash_import" ON "transactions" ("user_id", "dedupe_hash") WHERE "source" = 'import'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."UQ_transactions_user_dedupe_hash_import"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "CHK_transactions_amount_non_negative"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_c9e41213ca42d50132ed7ab2b0f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_5d5caaa3ab51a790c1404a0d77e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_e9acc6efa76de013e8c1553ed2b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3b8e40efad79f3ff19b4c87c89"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6c954e073341951a7cfeaf9c46"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8594f3deff3fda747008f489c3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5d5caaa3ab51a790c1404a0d77"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e9acc6efa76de013e8c1553ed2"`,
    );
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TYPE "public"."transactions_source_enum"`);
    await queryRunner.query(`DROP TYPE "public"."transactions_type_enum"`);
  }
}
