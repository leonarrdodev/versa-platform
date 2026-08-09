import {
  loadEnvFile,
} from 'node:process';

import {
  fileURLToPath,
} from 'node:url';

const envFilePath =
  fileURLToPath(
    new URL(
      '../../../../.env',
      import.meta.url,
    ),
  );

loadEnvFile(envFilePath);

function getRequired(
  name: string,
): string {
  const value =
    process.env[name];

  if (
    value === undefined ||
    value.trim() === ''
  ) {
    throw new Error(
      `Variável obrigatória não definida: ${name}`,
    );
  }

  return value;
}

function getPositiveInteger(
  name: string,
  fallback?: number,
): number {
  const rawValue =
    process.env[name];

  if (
    rawValue === undefined &&
    fallback !== undefined
  ) {
    return fallback;
  }

  const value = Number(
    getRequired(name),
  );

  if (
    !Number.isInteger(value) ||
    value <= 0
  ) {
    throw new Error(
      `${name} deve ser inteiro positivo`,
    );
  }

  return value;
}

function getBoolean(
  name: string,
): boolean {
  const value =
    getRequired(name);

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  throw new Error(
    `${name} deve ser "true" ou "false"`,
  );
}

export const env = {
  database: {
    host:
      getRequired(
        'DATABASE_HOST',
      ),

    port:
      getPositiveInteger(
        'DATABASE_PORT',
      ),

    database:
      getRequired(
        'DATABASE_NAME',
      ),

    user:
      getRequired(
        'DATABASE_USER',
      ),

    password:
      getRequired(
        'DATABASE_PASSWORD',
      ),

    ssl:
      getBoolean(
        'DATABASE_SSL',
      ),
  },

  pollIntervalMs:
    getPositiveInteger(
      'WORKER_POLL_INTERVAL_MS',
      1_000,
    ),
} as const;