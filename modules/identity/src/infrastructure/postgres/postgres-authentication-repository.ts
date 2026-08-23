import type {
  Pool,
} from 'pg';

import {
  isMembershipRole,
} from '../../domain/membership/membership-role.js';

import {
  isMembershipStatus,
} from '../../domain/membership/membership-status.js';

import {
  isTenantStatus,
} from '../../domain/tenant/tenant-status.js';

import {
  isUserStatus,
} from '../../domain/user/user-status.js';

import type {
  AuthenticationIdentity,
  AuthenticationMembership,
} from '../../application/authentication/authentication-identity.js';

import type {
  AuthenticationRepository,
} from '../../application/ports/authentication-repository.js';

interface AuthenticationRow {
  userId: string;

  email: string;
  normalizedEmail: string;
  displayName: string;

  userStatus: string;

  passwordHash: string;

  tenantId: string | null;
  tenantStatus: string | null;

  membershipRole: string | null;
  membershipStatus: string | null;
}

export class PostgresAuthenticationRepository
implements AuthenticationRepository {
  constructor(
    private readonly pool: Pool,
  ) {}

  async findByNormalizedEmail(
    normalizedEmail: string,
  ): Promise<
    AuthenticationIdentity | null
  > {
    const result =
      await this.pool.query<
        AuthenticationRow
      >(
        `
          SELECT
            u.id
              AS "userId",

            u.email,
            u.normalized_email
              AS "normalizedEmail",

            u.display_name
              AS "displayName",

            u.status
              AS "userStatus",

            pc.password_hash
              AS "passwordHash",

            t.id
              AS "tenantId",

            t.status
              AS "tenantStatus",

            tm.role
              AS "membershipRole",

            tm.status
              AS "membershipStatus"

          FROM users u

          INNER JOIN
            password_credentials pc
            ON pc.user_id = u.id

          LEFT JOIN
            tenant_memberships tm
            ON tm.user_id = u.id

          LEFT JOIN
            tenants t
            ON t.id = tm.tenant_id

          WHERE
            u.normalized_email = $1

          ORDER BY
            t.created_at ASC
        `,
        [
          normalizedEmail,
        ],
      );

    const firstRow =
      result.rows[0];

    if (
      firstRow === undefined
    ) {
      return null;
    }

    if (
      !isUserStatus(
        firstRow.userStatus,
      )
    ) {
      throw new Error(
        `Invalid user status from database: ${firstRow.userStatus}`,
      );
    }

    const memberships:
      AuthenticationMembership[] = [];

    for (
      const row
      of result.rows
    ) {
      if (
        row.tenantId === null
      ) {
        continue;
      }

      if (
        row.tenantStatus === null
        || row.membershipRole === null
        || row.membershipStatus === null
      ) {
        throw new Error(
          'Incomplete membership data returned from database',
        );
      }

      if (
        !isTenantStatus(
          row.tenantStatus,
        )
      ) {
        throw new Error(
          `Invalid tenant status from database: ${row.tenantStatus}`,
        );
      }

      if (
        !isMembershipRole(
          row.membershipRole,
        )
      ) {
        throw new Error(
          `Invalid membership role from database: ${row.membershipRole}`,
        );
      }

      if (
        !isMembershipStatus(
          row.membershipStatus,
        )
      ) {
        throw new Error(
          `Invalid membership status from database: ${row.membershipStatus}`,
        );
      }

      memberships.push({
        tenantId:
          row.tenantId,

        tenantStatus:
          row.tenantStatus,

        role:
          row.membershipRole,

        status:
          row.membershipStatus,
      });
    }

    return {
      userId:
        firstRow.userId,

      email:
        firstRow.email,

      normalizedEmail:
        firstRow.normalizedEmail,

      displayName:
        firstRow.displayName,

      userStatus:
        firstRow.userStatus,

      passwordHash:
        firstRow.passwordHash,

      memberships,
    };
  }
}