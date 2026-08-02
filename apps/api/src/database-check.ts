import { createDatabasePool } from '@versa/database';

import { env } from './config/env.js';

interface DatabaseIdentity {
  currentDatabase: string;
  currentUser: string;
}

async function main(): Promise<void> {
  const pool = createDatabasePool(env.database);

  try {
    const result = await pool.query<DatabaseIdentity>(`
      SELECT
        current_database() AS "currentDatabase",
        current_user AS "currentUser"
    `);

    const identity = result.rows[0];

    if (identity === undefined) {
      throw new Error('O PostgreSQL não retornou a identificação do banco');
    }

    console.info('[database] Conexão realizada com sucesso');
    console.info(`[database] Banco: ${identity.currentDatabase}`);
    console.info(`[database] Usuário: ${identity.currentUser}`);
  } finally {
    await pool.end();
  }
}

try {
  await main();
} catch (error) {
  console.error('[database] Falha ao conectar ao PostgreSQL');
  console.error(error);

  process.exitCode = 1;
}