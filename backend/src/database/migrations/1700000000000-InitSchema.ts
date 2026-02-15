import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1700000000000 implements MigrationInterface {
  name = 'InitSchema1700000000000';

  public async up(_queryRunner: QueryRunner): Promise<void> {
    // Initial migration placeholder.
    // Generate concrete migrations with:
    // npm run migration:generate -- src/database/migrations/<MigrationName>
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // No-op rollback for placeholder migration.
  }
}
