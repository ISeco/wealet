import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTransfer1782163391166 implements MigrationInterface {
  name = 'CreateTransfer1782163391166';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "transfers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "from_fund_id" uuid NOT NULL, "to_fund_id" uuid NOT NULL, "amount" bigint NOT NULL, "currency" character(3) NOT NULL DEFAULT 'CLP', "occurred_on" date NOT NULL, "note" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f712e908b465e0085b4408cabc3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ba27d1ebe999481ff98cfe51f6" ON "transfers"  ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "transfers" ADD CONSTRAINT "FK_ba27d1ebe999481ff98cfe51f6c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfers" ADD CONSTRAINT "FK_cbcbcb26a68185d7277ae9424f1" FOREIGN KEY ("from_fund_id") REFERENCES "funds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfers" ADD CONSTRAINT "FK_9cb871a6789977b856bb580e48b" FOREIGN KEY ("to_fund_id") REFERENCES "funds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfers" ADD CONSTRAINT "CHK_transfers_amount_positive" CHECK ("amount" > 0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfers" ADD CONSTRAINT "CHK_transfers_distinct_funds" CHECK ("from_fund_id" <> "to_fund_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transfers" DROP CONSTRAINT "CHK_transfers_distinct_funds"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfers" DROP CONSTRAINT "CHK_transfers_amount_positive"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfers" DROP CONSTRAINT "FK_9cb871a6789977b856bb580e48b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfers" DROP CONSTRAINT "FK_cbcbcb26a68185d7277ae9424f1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfers" DROP CONSTRAINT "FK_ba27d1ebe999481ff98cfe51f6c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ba27d1ebe999481ff98cfe51f6"`,
    );
    await queryRunner.query(`DROP TABLE "transfers"`);
  }
}
