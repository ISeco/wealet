import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategory1782163297651 implements MigrationInterface {
  name = 'CreateCategory1782163297651';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."categories_type_enum" AS ENUM('income', 'expense')`,
    );
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "name" text NOT NULL, "type" "public"."categories_type_enum" NOT NULL, "color" text, "is_system" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_ea3f375b219b0de83ba4ac71c17" UNIQUE ("user_id", "name", "type"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_2296b7fe012d95646fa41921c8b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    // regular UNIQUE(user_id, name, type) treats NULL user_id as distinct, so it would not
    // stop duplicate system categories — enforce that separately with a partial index.
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_categories_system_name_type" ON "categories" ("name", "type") WHERE "user_id" IS NULL`,
    );
    await queryRunner.query(`
            INSERT INTO "categories" ("name", "type", "color", "is_system") VALUES
                ('Salario', 'income', '#22C55E', true),
                ('Inversiones', 'income', '#06B6D4', true),
                ('Otros ingresos', 'income', '#A3A3A3', true),
                ('Vivienda', 'expense', '#F97316', true),
                ('Servicios', 'expense', '#EAB308', true),
                ('Alimentación', 'expense', '#84CC16', true),
                ('Transporte', 'expense', '#3B82F6', true),
                ('Salud', 'expense', '#EC4899', true),
                ('Entretenimiento', 'expense', '#8B5CF6', true),
                ('Educación', 'expense', '#14B8A6', true),
                ('Ropa', 'expense', '#F43F5E', true),
                ('Ahorro / Deudas', 'expense', '#0EA5E9', true),
                ('Otros gastos', 'expense', '#6B7280', true)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "categories" WHERE "is_system" = true`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."UQ_categories_system_name_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_2296b7fe012d95646fa41921c8b"`,
    );
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TYPE "public"."categories_type_enum"`);
  }
}
