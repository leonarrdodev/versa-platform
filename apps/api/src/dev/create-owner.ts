import {
  Argon2PasswordHasher,
  PostgresIdentityUnitOfWork,
  RegisterOwnerHandler,
  UserEmailAlreadyExistsError,
} from '@versa/identity';

import {
  createDatabasePool,
} from '@versa/database';

import {
  RandomUuidGenerator,
  SystemClock,
} from '@versa/shared-kernel';

import {
  env,
} from '../config/env.js';

function getRequiredArgument(
  name:
    string,
): string {
  const flag =
    `--${name}`;

  const index =
    process.argv.indexOf(
      flag,
    );

  if (
    index ===
    -1
  ) {
    throw new Error(
      `Missing required argument: ${flag}`,
    );
  }

  const value =
    process.argv[
      index + 1
    ];

  if (
    typeof value !==
      'string'
    ||
    value.trim() ===
      ''
  ) {
    throw new Error(
      `Missing value for argument: ${flag}`,
    );
  }

  return value;
}

function getRequiredPassword():
string {
  const password =
    process.env
      .VERSA_DEV_OWNER_PASSWORD;

  if (
    typeof password !==
      'string'
    ||
    password ===
      ''
  ) {
    throw new Error(
      [
        'VERSA_DEV_OWNER_PASSWORD is required.',
        'Provide it through the environment instead of a command-line argument.',
      ].join(
        ' ',
      ),
    );
  }

  return password;
}

const email =
  getRequiredArgument(
    'email',
  );

const displayName =
  getRequiredArgument(
    'name',
  );

const tenantName =
  getRequiredArgument(
    'tenant',
  );

const password =
  getRequiredPassword();

const pool =
  createDatabasePool(
    env.database,
  );

try {
  const handler =
    new RegisterOwnerHandler({
      clock:
        new SystemClock(),

      idGenerator:
        new RandomUuidGenerator(),

      passwordHasher:
        new Argon2PasswordHasher(),

      unitOfWork:
        new PostgresIdentityUnitOfWork(
          pool,
        ),
    });

  const result =
    await handler.execute({
      email,

      displayName,

      tenantName,

      password,
    });

  console.log(
    '',
  );

  console.log(
    'Versa owner created successfully.',
  );

  console.log(
    `User ID:   ${result.userId}`,
  );

  console.log(
    `Tenant ID: ${result.tenantId}`,
  );

  console.log(
    `Email:     ${email}`,
  );

  console.log(
    `Tenant:    ${tenantName}`,
  );

  console.log(
    '',
  );

  console.log(
    'You can now sign in through the Versa web interface.',
  );
} catch (error) {
  if (
    error instanceof
      UserEmailAlreadyExistsError
  ) {
    console.error(
      `A user with email "${email}" already exists.`,
    );

    process.exitCode =
      1;
  } else {
    throw error;
  }
} finally {
  await pool.end();
}