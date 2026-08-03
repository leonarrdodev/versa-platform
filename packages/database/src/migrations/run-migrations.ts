import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { Pool, PoolClient } from 'pg';

const MIGRATION_LOCK_ID = '92620260802';

interface AppliedMigrationRow {
  filename: string;
  checksum: string;
}

interface MigrationFile {
  filename: string;
  sql: string;
  checksum: string;
}

export interface MigrationRunResult {
  applied: string[];
  skipped: string[];
}

async function loadMigrationFiles(
  migrationsDirectory: string,
): Promise<MigrationFile[]> {
  const entries = await readdir(migrationsDirectory, {
    withFileTypes: true,
  });

  const filenames = entries
    .filter((entry) => {
      return entry.isFile() && entry.name.endsWith('.sql');
    })
    .map((entry) => entry.name)
    .sort();

  return Promise.all(
    filenames.map(async (filename) => {
      const filePath = join(migrationsDirectory, filename);
      const sql = await readFile(filePath, 'utf8');

      const checksum = createHash('sha256')
        .update(sql)
        .digest('hex');

      return {
        filename,
        sql,
        checksum,
      };
    }),
  );
}

async function ensureMigrationsTable(
  client: PoolClient,
): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      filename text NOT NULL UNIQUE,
      checksum text NOT NULL,
      executed_at timestamptz NOT NULL DEFAULT now()
    )
  `);
}

async function getAppliedMigrations(
  client: PoolClient,
): Promise<Map<string, string>> {
  const result = await client.query<AppliedMigrationRow>(`
    SELECT filename, checksum
    FROM schema_migrations
  `);

  return new Map(
    result.rows.map((row) => {
      return [row.filename, row.checksum];
    }),
  );
}

async function applyMigration(
  client: PoolClient,
  migration: MigrationFile,
): Promise<void> {
  await client.query('BEGIN');

  try {
    await client.query(migration.sql);

    await client.query(
      `
        INSERT INTO schema_migrations (
          filename,
          checksum
        )
        VALUES ($1, $2)
      `,
      [
        migration.filename,
        migration.checksum,
      ],
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

export async function runMigrations(
  pool: Pool,
  migrationsDirectory: string,
): Promise<MigrationRunResult> {
  const migrations = await loadMigrationFiles(
    migrationsDirectory,
  );

  const client = await pool.connect();
  let lockAcquired = false;

  try {
    await client.query(
      'SELECT pg_advisory_lock($1::bigint)',
      [MIGRATION_LOCK_ID],
    );

    lockAcquired = true;

    await ensureMigrationsTable(client);

    const appliedMigrations =
      await getAppliedMigrations(client);

    const result: MigrationRunResult = {
      applied: [],
      skipped: [],
    };

    for (const migration of migrations) {
      const existingChecksum = appliedMigrations.get(
        migration.filename,
      );

      if (existingChecksum !== undefined) {
        if (existingChecksum !== migration.checksum) {
          throw new Error(
            `A migration ${migration.filename} foi alterada depois de aplicada`,
          );
        }

        result.skipped.push(migration.filename);
        continue;
      }

      await applyMigration(client, migration);
      result.applied.push(migration.filename);
    }

    return result;
  } finally {
    try {
      if (lockAcquired) {
        await client.query(
          'SELECT pg_advisory_unlock($1::bigint)',
          [MIGRATION_LOCK_ID],
        );
      }
    } finally {
      client.release();
    }
  }
}