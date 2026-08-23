import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  parseUuid,
} from '@versa/shared-kernel';

import type {
  Clock,
  IdGenerator,
  Uuid,
} from '@versa/shared-kernel';

import {
  RegisterOwnerHandler,
} from '../src/index.js';

import type {
  IdentityTransaction,
  IdentityUnitOfWork,
  PasswordCredential,
  PasswordCredentialRepository,
  PasswordHasher,
  Tenant,
  TenantMembership,
  TenantMembershipRepository,
  TenantRepository,
  User,
  UserRepository,
} from '../src/index.js';

class FixedClock implements Clock {
  constructor(
    private readonly fixedDate: Date,
  ) {}

  now(): Date {
    return new Date(
      this.fixedDate.getTime(),
    );
  }
}

class SequenceIdGenerator implements IdGenerator {
  private currentIndex = 0;

  constructor(
    private readonly values:
      readonly Uuid[],
  ) {}

  generate(): Uuid {
    const value =
      this.values[
        this.currentIndex
      ];

    if (value === undefined) {
      throw new Error(
        'No UUID configured for this generation',
      );
    }

    this.currentIndex += 1;

    return value;
  }
}

class FakePasswordHasher
implements PasswordHasher {
  readonly hashedPasswords:
    string[] = [];

  async hash(
    plainPassword: string,
  ): Promise<string> {
    this.hashedPasswords.push(
      plainPassword,
    );

    return '$argon2id$fake-password-hash';
  }

  async verify(
    plainPassword: string,
    passwordHash: string,
  ): Promise<boolean> {
    return (
      plainPassword ===
        'uma senha longa e segura'
      &&
      passwordHash ===
        '$argon2id$fake-password-hash'
    );
  }
}

class InMemoryIdentityUnitOfWork
implements IdentityUnitOfWork {
  readonly committedUsers:
    User[] = [];

  readonly committedTenants:
    Tenant[] = [];

  readonly committedMemberships:
    TenantMembership[] = [];

  readonly committedCredentials:
    PasswordCredential[] = [];

  transactionsStarted = 0;

  failWhenInsertingMembership =
    false;

  failWhenInsertingCredential =
    false;

  async execute<T>(
    work: (
      transaction:
        IdentityTransaction,
    ) => Promise<T>,
  ): Promise<T> {
    this.transactionsStarted += 1;

    const stagedUsers:
      User[] = [];

    const stagedTenants:
      Tenant[] = [];

    const stagedMemberships:
      TenantMembership[] = [];

    const stagedCredentials:
      PasswordCredential[] = [];

    const userRepository:
      UserRepository = {
        insert: async (
          user: User,
        ): Promise<void> => {
          stagedUsers.push(
            user,
          );
        },
      };

    const tenantRepository:
      TenantRepository = {
        insert: async (
          tenant: Tenant,
        ): Promise<void> => {
          stagedTenants.push(
            tenant,
          );
        },
      };

    const membershipRepository:
      TenantMembershipRepository = {
        insert: async (
          membership:
            TenantMembership,
        ): Promise<void> => {
          if (
            this
              .failWhenInsertingMembership
          ) {
            throw new Error(
              'Membership persistence failed',
            );
          }

          stagedMemberships.push(
            membership,
          );
        },
      };

    const credentialRepository:
      PasswordCredentialRepository = {
        insert: async (
          credential:
            PasswordCredential,
        ): Promise<void> => {
          if (
            this
              .failWhenInsertingCredential
          ) {
            throw new Error(
              'Credential persistence failed',
            );
          }

          stagedCredentials.push(
            credential,
          );
        },
      };

    const transaction:
      IdentityTransaction = {
        users:
          userRepository,

        tenants:
          tenantRepository,

        memberships:
          membershipRepository,

        credentials:
          credentialRepository,
      };

    const result =
      await work(
        transaction,
      );

    this.committedUsers.push(
      ...stagedUsers,
    );

    this.committedTenants.push(
      ...stagedTenants,
    );

    this.committedMemberships.push(
      ...stagedMemberships,
    );

    this.committedCredentials.push(
      ...stagedCredentials,
    );

    return result;
  }
}

const USER_ID = parseUuid(
  '11111111-1111-4111-8111-111111111111',
);

const TENANT_ID = parseUuid(
  '22222222-2222-4222-8222-222222222222',
);

const FIXED_DATE = new Date(
  '2026-08-23T14:30:00.000Z',
);

function createDependencies(): {
  readonly unitOfWork:
    InMemoryIdentityUnitOfWork;

  readonly passwordHasher:
    FakePasswordHasher;

  readonly handler:
    RegisterOwnerHandler;
} {
  const unitOfWork =
    new InMemoryIdentityUnitOfWork();

  const passwordHasher =
    new FakePasswordHasher();

  const handler =
    new RegisterOwnerHandler({
      clock:
        new FixedClock(
          FIXED_DATE,
        ),

      idGenerator:
        new SequenceIdGenerator([
          USER_ID,
          TENANT_ID,
        ]),

      passwordHasher,

      unitOfWork,
    });

  return {
    unitOfWork,
    passwordHasher,
    handler,
  };
}

describe('RegisterOwnerHandler', () => {
  it('registers an owner and returns the result', async () => {
    const {
      handler,
    } = createDependencies();

    const result =
      await handler.execute({
        email:
          '  Leo@Example.COM  ',

        displayName:
          '  Leonardo   Silva  ',

        tenantName:
          '  Versa   Wear  ',

        password:
          'uma senha longa e segura',
      });

    expect(result).toEqual({
      userId:
        USER_ID,

      tenantId:
        TENANT_ID,

      email:
        'Leo@Example.COM',

      displayName:
        'Leonardo Silva',

      tenantName:
        'Versa Wear',

      userStatus:
        'active',

      tenantStatus:
        'active',

      membershipRole:
        'owner',

      membershipStatus:
        'active',

      createdAt:
        '2026-08-23T14:30:00.000Z',
    });
  });

  it('hashes the password before persistence', async () => {
    const {
      handler,
      passwordHasher,
    } = createDependencies();

    await handler.execute({
      email:
        'leo@example.com',

      displayName:
        'Leonardo',

      tenantName:
        'Versa Wear',

      password:
        'uma senha longa e segura',
    });

    expect(
      passwordHasher
        .hashedPasswords,
    ).toEqual([
      'uma senha longa e segura',
    ]);
  });

  it('persists user, tenant, membership and credential', async () => {
    const {
      handler,
      unitOfWork,
    } = createDependencies();

    await handler.execute({
      email:
        'leo@example.com',

      displayName:
        'Leonardo Silva',

      tenantName:
        'Versa Wear',

      password:
        'uma senha longa e segura',
    });

    expect(
      unitOfWork
        .committedUsers,
    ).toHaveLength(1);

    expect(
      unitOfWork
        .committedTenants,
    ).toHaveLength(1);

    expect(
      unitOfWork
        .committedMemberships,
    ).toHaveLength(1);

    expect(
      unitOfWork
        .committedCredentials,
    ).toHaveLength(1);

    const user =
      unitOfWork
        .committedUsers[0];

    const tenant =
      unitOfWork
        .committedTenants[0];

    const membership =
      unitOfWork
        .committedMemberships[0];

    const credential =
      unitOfWork
        .committedCredentials[0];

    expect(
      user?.id,
    ).toBe(
      USER_ID,
    );

    expect(
      tenant?.id,
    ).toBe(
      TENANT_ID,
    );

    expect(
      membership?.userId,
    ).toBe(
      USER_ID,
    );

    expect(
      membership?.tenantId,
    ).toBe(
      TENANT_ID,
    );

    expect(
      membership?.role,
    ).toBe(
      'owner',
    );

    expect(
      credential?.userId,
    ).toBe(
      USER_ID,
    );

    expect(
      credential
        ?.passwordHash
        .value,
    ).toBe(
      '$argon2id$fake-password-hash',
    );
  });

  it('uses a single transaction', async () => {
    const {
      handler,
      unitOfWork,
    } = createDependencies();

    await handler.execute({
      email:
        'leo@example.com',

      displayName:
        'Leonardo',

      tenantName:
        'Versa Wear',

      password:
        'uma senha longa e segura',
    });

    expect(
      unitOfWork
        .transactionsStarted,
    ).toBe(1);
  });

  it('does not commit partial identity data when membership persistence fails', async () => {
    const {
      handler,
      unitOfWork,
    } = createDependencies();

    unitOfWork
      .failWhenInsertingMembership =
        true;

    await expect(
      handler.execute({
        email:
          'leo@example.com',

        displayName:
          'Leonardo',

        tenantName:
          'Versa Wear',

        password:
          'uma senha longa e segura',
      }),
    ).rejects.toThrow(
      'Membership persistence failed',
    );

    expect(
      unitOfWork
        .committedUsers,
    ).toHaveLength(0);

    expect(
      unitOfWork
        .committedTenants,
    ).toHaveLength(0);

    expect(
      unitOfWork
        .committedMemberships,
    ).toHaveLength(0);

    expect(
      unitOfWork
        .committedCredentials,
    ).toHaveLength(0);
  });

  it('does not commit partial identity data when credential persistence fails', async () => {
    const {
      handler,
      unitOfWork,
    } = createDependencies();

    unitOfWork
      .failWhenInsertingCredential =
        true;

    await expect(
      handler.execute({
        email:
          'leo@example.com',

        displayName:
          'Leonardo',

        tenantName:
          'Versa Wear',

        password:
          'uma senha longa e segura',
      }),
    ).rejects.toThrow(
      'Credential persistence failed',
    );

    expect(
      unitOfWork
        .committedUsers,
    ).toHaveLength(0);

    expect(
      unitOfWork
        .committedTenants,
    ).toHaveLength(0);

    expect(
      unitOfWork
        .committedMemberships,
    ).toHaveLength(0);

    expect(
      unitOfWork
        .committedCredentials,
    ).toHaveLength(0);
  });

  it('does not hash or open a transaction when the command is invalid', async () => {
    const {
      handler,
      unitOfWork,
      passwordHasher,
    } = createDependencies();

    await expect(
      handler.execute({
        email:
          'not-an-email',

        displayName:
          'Leonardo',

        tenantName:
          'Versa Wear',

        password:
          'uma senha longa e segura',
      }),
    ).rejects.toThrow(
      'Email has an invalid format',
    );

    expect(
      passwordHasher
        .hashedPasswords,
    ).toHaveLength(0);

    expect(
      unitOfWork
        .transactionsStarted,
    ).toBe(0);
  });

  it('rejects an invalid password before opening a transaction', async () => {
    const {
      handler,
      unitOfWork,
      passwordHasher,
    } = createDependencies();

    await expect(
      handler.execute({
        email:
          'leo@example.com',

        displayName:
          'Leonardo',

        tenantName:
          'Versa Wear',

        password:
          'curta',
      }),
    ).rejects.toThrow(
      'Password must have at least 15 characters',
    );

    expect(
      passwordHasher
        .hashedPasswords,
    ).toHaveLength(0);

    expect(
      unitOfWork
        .transactionsStarted,
    ).toBe(0);
  });
});