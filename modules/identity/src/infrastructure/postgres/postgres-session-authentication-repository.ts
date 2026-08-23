import type {
  Pool,
} from 'pg';

import type {
  SessionAuthenticationRepository,
} from '../../application/ports/session-authentication-repository.js';

import type {
  SessionAuthentication,
} from '../../application/session/session-authentication.js';

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
  SessionTokenHash,
} from '../../domain/session/session-token-hash.js';

interface SessionAuthenticationRow {
  sessionId: string;

  userId: string;

  email: string;

  displayName: string;

  userStatus: string;

  activeTenantId:
    string | null;

  tenantStatus:
    string | null;

  membershipRole:
    string | null;

  membershipStatus:
    string | null;

  createdAt: Date;

  expiresAt: Date;

  lastSeenAt: Date;

  revokedAt:
    Date | null;
}

export class PostgresSessionAuthenticationRepository
implements SessionAuthenticationRepository {
  constructor(
    private readonly pool:
      Pool,
  ) {}

  async findByTokenHash(
    tokenHash: SessionTokenHash,
  ): Promise<
    SessionAuthentication | null
  > {
    const result =
      await this.pool
        .query<SessionAuthenticationRow>(
          `
            SELECT
              s.id
                AS "sessionId",

              u.id
                AS "userId",

              u.email
                AS "email",

              u.display_name
                AS "displayName",

              u.status
                AS "userStatus",

              s.active_tenant_id
                AS "activeTenantId",

              t.status
                AS "tenantStatus",

              tm.role
                AS "membershipRole",

              tm.status
                AS "membershipStatus",

              s.created_at
                AS "createdAt",

              s.expires_at
                AS "expiresAt",

              s.last_seen_at
                AS "lastSeenAt",

              s.revoked_at
                AS "revokedAt"

            FROM sessions s

            INNER JOIN users u
              ON u.id = s.user_id

            LEFT JOIN tenants t
              ON t.id =
                s.active_tenant_id

            LEFT JOIN tenant_memberships tm
              ON tm.user_id =
                s.user_id
              AND tm.tenant_id =
                s.active_tenant_id

            WHERE s.token_hash = $1

            LIMIT 1
          `,
          [
            tokenHash.value,
          ],
        );

    const row =
      result.rows[0];

    if (
      row === undefined
    ) {
      return null;
    }

    if (
      !isUserStatus(
        row.userStatus,
      )
    ) {
      throw new Error(
        'Invalid user status returned from database',
      );
    }

    if (
      row.activeTenantId ===
      null
    ) {
      if (
        row.tenantStatus !== null
        || row.membershipRole !== null
        || row.membershipStatus !== null
      ) {
        throw new Error(
          'Unexpected tenant data returned for session without active tenant',
        );
      }

      return {
        ...row,

        userStatus:
          row.userStatus,

        tenantStatus:
          null,

        membershipRole:
          null,

        membershipStatus:
          null,
      };
    }

    if (
      row.tenantStatus === null
      || row.membershipRole === null
      || row.membershipStatus === null
    ) {
      throw new Error(
        'Incomplete active tenant data returned from database',
      );
    }

    if (
      !isTenantStatus(
        row.tenantStatus,
      )
    ) {
      throw new Error(
        'Invalid tenant status returned from database',
      );
    }

    if (
      !isMembershipRole(
        row.membershipRole,
      )
    ) {
      throw new Error(
        'Invalid membership role returned from database',
      );
    }

    if (
      !isMembershipStatus(
        row.membershipStatus,
      )
    ) {
      throw new Error(
        'Invalid membership status returned from database',
      );
    }

    return {
      ...row,

      userStatus:
        row.userStatus,

      tenantStatus:
        row.tenantStatus,

      membershipRole:
        row.membershipRole,

      membershipStatus:
        row.membershipStatus,
    };
  }
}