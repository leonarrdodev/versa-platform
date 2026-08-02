import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';

const envFilePath = fileURLToPath(
  new URL('../../../../.env', import.meta.url),
);

loadEnvFile(envFilePath);

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (value === undefined || value.trim() === '') {
    throw new Error(
      `Variável de ambiente obrigatória não definida: ${name}`,
    );
  }

  return value;
}

function getNumberEnvironmentVariable(name: string): number {
  const rawValue = getRequiredEnvironmentVariable(name);
  const value = Number(rawValue);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(
      `Variável de ambiente ${name} deve ser um número inteiro positivo`,
    );
  }

  return value;
}

function getBooleanEnvironmentVariable(name: string): boolean {
  const value = getRequiredEnvironmentVariable(name);

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  throw new Error(
    `Variável de ambiente ${name} deve ser "true" ou "false"`,
  );
}

export const env = {
  nodeEnv: getRequiredEnvironmentVariable('NODE_ENV'),

  api: {
    host: getRequiredEnvironmentVariable('API_HOST'),
    port: getNumberEnvironmentVariable('API_PORT'),
  },

  database: {
    host: getRequiredEnvironmentVariable('DATABASE_HOST'),
    port: getNumberEnvironmentVariable('DATABASE_PORT'),
    database: getRequiredEnvironmentVariable('DATABASE_NAME'),
    user: getRequiredEnvironmentVariable('DATABASE_USER'),
    password: getRequiredEnvironmentVariable('DATABASE_PASSWORD'),
    ssl: getBooleanEnvironmentVariable('DATABASE_SSL'),
  },

  logLevel: getRequiredEnvironmentVariable('LOG_LEVEL'),
} as const;