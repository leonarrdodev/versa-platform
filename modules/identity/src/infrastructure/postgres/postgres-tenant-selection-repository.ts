import type {
  Pool,
} from 'pg';

import type {
  TenantSelectionRepository,
  SetActiveTenantInput,
} from '../../application/ports/tenant-selection-repository.js';

import type {
  AvailableTenant,
} from '../../application/tenant-selection/available-tenant.js';

import {
  isMembershipRole,
} from '../../domain/membership/membership-role.js';

interface AvailableTenantRow {
  readonly id:
    string;

  readonly name:
    string;

  readonly role:
    string;
}

interface UpdatedSessionRow {
  readonly id:
    string;
}

export class PostgresTenantSelectionRepository
implements TenantSelectionRepository {
  constructor(
    private readonly pool:
      Pool,
  ) {}

  async listAvailableTenants(
    userId:
      string,
  ): Promise<
    readonly AvailableTenant[]
  > {
    const result =
      await this.pool
        .query<AvailableTenantRow>(
          `
            SELECT
              t.id
                AS "id",

              t.name
                AS "name",

              tm.role
                AS "role"

            FROM tenant_memberships tm

            INNER JOIN tenants t
              ON t.id =
                tm.tenant_id

            WHERE
              tm.user_id = $1
              AND tm.status = 'active'
              AND t.status = 'active'

            ORDER BY
              LOWER(t.name),
              t.id
          `,
          [
            userId,
          ],
        );

    return result.rows.map(
      (
        row,
      ): AvailableTenant => {
        if (
          !isMembershipRole(
            row.role,
          )
        ) {
          throw new Error(
            'Invalid membership role returned from database',
          );
        }

        return {
          id:
            row.id,

          name:
            row.name,

          role:
            row.role,
        };
      },
    );
  }

  async setActiveTenant(
    input:
      SetActiveTenantInput,
  ): Promise<boolean> {
    /*
     * A checagem de autorização e o
     * UPDATE acontecem na mesma
     * instrução SQL.
     *
     * Portanto, não fazemos:
     *
     * SELECT membership
     * → código JS
     * → UPDATE session
     *
     * evitando uma janela entre
     * validação e alteração.
     */
    const result =
      await this.pool
        .query<UpdatedSessionRow>(
          `
            UPDATE sessions s

            SET
              active_tenant_id = $3

            WHERE
              s.id = $1
              AND s.user_id = $2

              AND EXISTS (
                SELECT 1

                FROM tenant_memberships tm

                INNER JOIN tenants t
                  ON t.id =
                    tm.tenant_id

                WHERE
                  tm.user_id = s.user_id
                  AND tm.tenant_id = $3
                  AND tm.status = 'active'
                  AND t.status = 'active'
              )

            RETURNING
              s.id
                AS "id"
          `,
          [
            input.sessionId,

            input.userId,

            input.tenantId,
          ],
        );

    return (
      result.rows[0] !==
      undefined
    );
  }
}