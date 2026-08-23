import type {
  Clock,
  IdGenerator,
} from '@versa/shared-kernel';

import {
  PasswordCredential,
} from '../../domain/credential/password-credential.js';

import {
  PasswordHash,
} from '../../domain/credential/password-hash.js';

import {
  PasswordSecret,
} from '../../domain/credential/password-secret.js';

import {
  TenantMembership,
} from '../../domain/membership/tenant-membership.js';

import {
  Tenant,
} from '../../domain/tenant/tenant.js';

import {
  TenantName,
} from '../../domain/tenant/tenant-name.js';

import {
  DisplayName,
} from '../../domain/user/display-name.js';

import {
  Email,
} from '../../domain/user/email.js';

import {
  User,
} from '../../domain/user/user.js';

import type {
  IdentityUnitOfWork,
} from '../ports/identity-unit-of-work.js';

import type {
  PasswordHasher,
} from '../ports/password-hasher.js';

import type {
  RegisterOwnerCommand,
} from './register-owner-command.js';

import type {
  RegisterOwnerResult,
} from './register-owner-result.js';

export interface RegisterOwnerHandlerDependencies {
  readonly clock: Clock;
  readonly idGenerator: IdGenerator;

  readonly passwordHasher:
    PasswordHasher;

  readonly unitOfWork:
    IdentityUnitOfWork;
}

export class RegisterOwnerHandler {
  constructor(
    private readonly dependencies:
      RegisterOwnerHandlerDependencies,
  ) {}

  async execute(
    command: RegisterOwnerCommand,
  ): Promise<RegisterOwnerResult> {
    const email =
      Email.create(
        command.email,
      );

    const displayName =
      DisplayName.create(
        command.displayName,
      );

    const tenantName =
      TenantName.create(
        command.tenantName,
      );

    const password =
      PasswordSecret.create(
        command.password,
      );

    const user =
      User.create(
        {
          email,
          displayName,
        },
        {
          clock:
            this.dependencies.clock,

          idGenerator:
            this.dependencies.idGenerator,
        },
      );

    const tenant =
      Tenant.create(
        {
          name: tenantName,
        },
        {
          clock:
            this.dependencies.clock,

          idGenerator:
            this.dependencies.idGenerator,
        },
      );

    const membership =
      TenantMembership.create(
        {
          userId: user.id,
          tenantId: tenant.id,
          role: 'owner',
        },
        {
          clock:
            this.dependencies.clock,
        },
      );

    /*
     * Hashing é propositalmente executado
     * antes da transação PostgreSQL.
     *
     * Argon2 é computacionalmente caro e não
     * queremos manter uma conexão/transação
     * aberta enquanto o hash é calculado.
     */
    const rawPasswordHash =
      await this.dependencies
        .passwordHasher
        .hash(
          password.exposeForHashing(),
        );

    const passwordHash =
      PasswordHash.create(
        rawPasswordHash,
      );

    const credential =
      PasswordCredential.create(
        {
          userId: user.id,
          passwordHash,
        },
        {
          clock:
            this.dependencies.clock,
        },
      );

    await this.dependencies
      .unitOfWork
      .execute(
        async (transaction) => {
          await transaction
            .users
            .insert(user);

          await transaction
            .tenants
            .insert(tenant);

          await transaction
            .memberships
            .insert(membership);

          await transaction
            .credentials
            .insert(credential);
        },
      );

    return {
      userId:
        user.id,

      tenantId:
        tenant.id,

      email:
        user.email.value,

      displayName:
        user.displayName.value,

      tenantName:
        tenant.name.value,

      userStatus:
        user.status,

      tenantStatus:
        tenant.status,

      membershipRole:
        membership.role,

      membershipStatus:
        membership.status,

      createdAt:
        user.createdAt
          .toISOString(),
    };
  }
}