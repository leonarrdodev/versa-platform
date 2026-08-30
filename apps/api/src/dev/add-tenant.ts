import {
  randomUUID,
} from 'node:crypto';

import {
  createDatabasePool,
} from '@versa/database';

import {
  env,
} from '../config/env.js';

type MembershipRole =
  | 'owner'
  | 'admin'
  | 'member';

interface UserRow {
  readonly id:
    string;
}

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

  return value.trim();
}

function parseRole(
  value:
    string,
): MembershipRole {
  if (
    value ===
      'owner'
    ||
    value ===
      'admin'
    ||
    value ===
      'member'
  ) {
    return value;
  }

  throw new Error(
    [
      'Invalid role.',
      'Expected one of:',
      'owner, admin, member.',
    ].join(
      ' ',
    ),
  );
}

function normalizeEmail(
  value:
    string,
): string {
  return value
    .trim()
    .toLowerCase();
}

const email =
  getRequiredArgument(
    'email',
  );

const tenantName =
  getRequiredArgument(
    'tenant',
  );

const role =
  parseRole(
    getRequiredArgument(
      'role',
    ),
  );

const normalizedEmail =
  normalizeEmail(
    email,
  );

const tenantId =
  randomUUID();

const pool =
  createDatabasePool(
    env.database,
  );

const client =
  await pool.connect();

try {
  await client.query(
    'BEGIN',
  );

  /*
   * Procuramos pelo mesmo campo
   * normalizado usado para garantir
   * unicidade de e-mail no Identity.
   */
  const userResult =
    await client.query<UserRow>(
      `
        SELECT
          id

        FROM users

        WHERE normalized_email = $1

        LIMIT 1
      `,
      [
        normalizedEmail,
      ],
    );

  const user =
    userResult.rows[0];

  if (
    user === undefined
  ) {
    throw new Error(
      `No user found with email "${email}".`,
    );
  }

  /*
   * Cria a nova empresa.
   */
  await client.query(
    `
      INSERT INTO tenants (
        id,
        name,
        status,
        created_at,
        updated_at
      )
      VALUES (
        $1,
        $2,
        'active',
        NOW(),
        NOW()
      )
    `,
    [
      tenantId,
      tenantName,
    ],
  );

  /*
   * Liga o usuário existente ao
   * novo tenant.
   */
  await client.query(
    `
      INSERT INTO tenant_memberships (
        user_id,
        tenant_id,
        role,
        status,
        created_at,
        updated_at
      )
      VALUES (
        $1,
        $2,
        $3,
        'active',
        NOW(),
        NOW()
      )
    `,
    [
      user.id,
      tenantId,
      role,
    ],
  );

  await client.query(
    'COMMIT',
  );

  console.log(
    '',
  );

  console.log(
    'Versa tenant created successfully.',
  );

  console.log(
    `User ID:   ${user.id}`,
  );

  console.log(
    `Tenant ID: ${tenantId}`,
  );

  console.log(
    `Email:     ${email}`,
  );

  console.log(
    `Tenant:    ${tenantName}`,
  );

  console.log(
    `Role:      ${role}`,
  );

  console.log(
    '',
  );

  console.log(
    'The tenant is now available to this user.',
  );
} catch (error) {
  await client.query(
    'ROLLBACK',
  );

  throw error;
} finally {
  client.release();

  await pool.end();
}