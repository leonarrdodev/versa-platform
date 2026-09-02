import {
  randomUUID,
} from 'node:crypto';

import {
  createDatabasePool,
} from '@versa/database';

type DatabasePool =
  ReturnType<
    typeof createDatabasePool
  >;

interface CreateTestCategoryInput {
  readonly pool:
    DatabasePool;

  readonly tenantId:
    string;

  readonly name?:
    string;
}

export async function createTestCategory(
  input:
    CreateTestCategoryInput,
): Promise<string> {
  const id =
    randomUUID();

  const name =
    input.name ??
    `Categoria E2E ${id}`;

  const normalizedName =
    name
      .normalize('NFC')
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();

  await input.pool.query(
    `
      INSERT INTO categories (
        id,
        tenant_id,
        name,
        normalized_name,
        status
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        'active'
      )
    `,
    [
      id,
      input.tenantId,
      name,
      normalizedName,
    ],
  );

  return id;
}

export async function cleanupTenantCatalog(
  pool:
    DatabasePool,

  tenantId:
    string,
): Promise<void> {
  await pool.query(
    `
      DELETE
      FROM product_read_model
      WHERE tenant_id = $1
    `,
    [
      tenantId,
    ],
  );

  await pool.query(
    `
      DELETE
      FROM event_outbox
      WHERE tenant_id = $1
    `,
    [
      tenantId,
    ],
  );

  /*
   * Products precisam sair antes
   * de Categories por causa da
   * FK composta criada na 0009.
   */
  await pool.query(
    `
      DELETE
      FROM products
      WHERE tenant_id = $1
    `,
    [
      tenantId,
    ],
  );

  await pool.query(
    `
      DELETE
      FROM categories
      WHERE tenant_id = $1
    `,
    [
      tenantId,
    ],
  );
}