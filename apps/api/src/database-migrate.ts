import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createDatabasePool,
  runMigrations,
} from '@versa/database';

import { env } from './config/env.js';

const currentDirectory = dirname(
  fileURLToPath(import.meta.url),
);

const migrationsDirectory = resolve(
  currentDirectory,
  '../../../packages/database/migrations',
);

async function main(): Promise<void> {
  const pool = createDatabasePool(env.database);

  try {
    const result = await runMigrations(
      pool,
      migrationsDirectory,
    );

    for (const filename of result.applied) {
      console.info(`[migration] Aplicada: ${filename}`);
    }

    for (const filename of result.skipped) {
      console.info(`[migration] Já aplicada: ${filename}`);
    }

    if (
      result.applied.length === 0
      && result.skipped.length === 0
    ) {
      console.info('[migration] Nenhuma migration encontrada');
    }

    console.info('[migration] Processo finalizado');
  } finally {
    await pool.end();
  }
}

void main().catch((error: unknown) => {
  console.error('[migration] Falha ao executar migrations');
  console.error(error);

  process.exitCode = 1;
});