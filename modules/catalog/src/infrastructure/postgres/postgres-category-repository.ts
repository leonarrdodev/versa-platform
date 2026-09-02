import type {
  PoolClient,
} from 'pg';

import type {
  CategoryRepository,
} from '../../application/ports/category-repository.js';

import type {
  Category,
} from '../../domain/category/category.js';

import {
  CategoryNameAlreadyExistsError,
} from '../../domain/category/category-name-already-exists-error.js';

const CATEGORY_TENANT_NAME_UNIQUE_CONSTRAINT =
  'categories_tenant_name_unique';

function isTenantNameUniqueViolation(
  error: unknown,
): boolean {
  if (
    typeof error !== 'object' ||
    error === null
  ) {
    return false;
  }

  const candidate =
    error as {
      code?: unknown;
      constraint?: unknown;
    };

  return (
    candidate.code === '23505' &&
    candidate.constraint ===
      CATEGORY_TENANT_NAME_UNIQUE_CONSTRAINT
  );
}

export class PostgresCategoryRepository
implements CategoryRepository {
  constructor(
    private readonly client:
      PoolClient,
  ) {}

  async insert(
    category: Category,
  ): Promise<void> {
    try {
      await this.client.query(
        `
          INSERT INTO categories (
            id,
            tenant_id,
            name,
            normalized_name,
            status,
            created_at,
            updated_at
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7
          )
        `,
        [
          category.id,
          category.tenantId,
          category.name.value,
          category.name.normalizedValue,
          category.status,
          category.createdAt,
          category.updatedAt,
        ],
      );
    } catch (error) {
      if (
        isTenantNameUniqueViolation(
          error,
        )
      ) {
        throw new CategoryNameAlreadyExistsError();
      }

      throw error;
    }
  }
}