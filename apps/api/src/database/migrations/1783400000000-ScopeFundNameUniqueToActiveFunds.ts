import { MigrationInterface, QueryRunner } from 'typeorm';

export class ScopeFundNameUniqueToActiveFunds1783400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Data fix: a user may already have two *active* funds sharing a name
    // (e.g. an orphaned framework-slot fund from a previous framework switch
    // that was never archived before this release). Keep the most recently
    // created fund per (user_id, name) active and archive the rest, so the
    // unique index below can be created without violating existing data.
    await queryRunner.query(`
      WITH ranked AS (
        SELECT id, ROW_NUMBER() OVER (
          PARTITION BY user_id, name ORDER BY created_at DESC
        ) AS rn
        FROM funds
        WHERE archived_at IS NULL
      )
      UPDATE funds SET archived_at = now(), is_operative = false
      WHERE id IN (SELECT id FROM ranked WHERE rn > 1)
    `);

    // Previously: unique name only among "own" funds (framework_slot IS NULL).
    // Framework-slot funds were only deduplicated by slot (UQ_funds_user_slot),
    // so a slot fund and an own fund could share a display name while both
    // were visible — confusing in dropdowns and the activity timeline.
    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_funds_user_name_no_slot"`,
    );

    // Unique name among *active* funds only, regardless of origin (own or
    // framework slot). Archiving a fund frees its name for reuse — this is
    // what lets a fund reactivate under its original name when the user
    // switches back to a framework that used it before.
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_funds_user_name_active"
       ON "funds" ("user_id", "name")
       WHERE "archived_at" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_funds_user_name_active"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_funds_user_name_no_slot"
       ON "funds" ("user_id", "name")
       WHERE "framework_slot" IS NULL`,
    );
    // Note: the archived_at changes made by the data fix above are not reverted.
  }
}
