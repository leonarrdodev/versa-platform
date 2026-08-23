import type {
  TenantMembershipRepository,
} from './tenant-membership-repository.js';

import type {
  TenantRepository,
} from './tenant-repository.js';

import type {
  UserRepository,
} from './user-repository.js';

import type {
  PasswordCredentialRepository,
} from './password-credential-repository.js';

export interface IdentityTransaction {
  readonly users: UserRepository;
  readonly tenants: TenantRepository;

  readonly memberships:
    TenantMembershipRepository;

     readonly credentials:
    PasswordCredentialRepository;
}

export interface IdentityUnitOfWork {
  execute<T>(
    work: (
      transaction:
        IdentityTransaction,
    ) => Promise<T>,
  ): Promise<T>;
}