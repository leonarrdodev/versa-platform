import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  InvalidCredentialsError,
  LoginHandler,
} from '../src/index.js';

import type {
  AuthenticationIdentity,
  AuthenticationRepository,
  PasswordHasher,
} from '../src/index.js';

class InMemoryAuthenticationRepository
implements AuthenticationRepository {
  requestedEmails:
    string[] = [];

  constructor(
    private readonly identity:
      AuthenticationIdentity | null,
  ) {}

  async findByNormalizedEmail(
    normalizedEmail: string,
  ): Promise<
    AuthenticationIdentity | null
  > {
    this.requestedEmails.push(
      normalizedEmail,
    );

    return this.identity;
  }
}

class FakePasswordHasher
implements PasswordHasher {
  readonly hashedPasswords:
    string[] = [];

  readonly verifications: {
    plainPassword: string;
    passwordHash: string;
  }[] = [];

  constructor(
    private readonly verificationResult:
      boolean,
  ) {}

  async hash(
    plainPassword: string,
  ): Promise<string> {
    this.hashedPasswords.push(
      plainPassword,
    );

    return '$argon2id$dummy';
  }

  async verify(
    plainPassword: string,
    passwordHash: string,
  ): Promise<boolean> {
    this.verifications.push({
      plainPassword,
      passwordHash,
    });

    return this.verificationResult;
  }
}

const ACTIVE_IDENTITY:
AuthenticationIdentity = {
  userId:
    '11111111-1111-4111-8111-111111111111',

  email:
    'Leo@Example.COM',

  normalizedEmail:
    'leo@example.com',

  displayName:
    'Leonardo',

  userStatus:
    'active',

  passwordHash:
    '$argon2id$stored-password',

  memberships: [
    {
      tenantId:
        '22222222-2222-4222-8222-222222222222',

      tenantStatus:
        'active',

      role:
        'owner',

      status:
        'active',
    },

    {
      tenantId:
        '33333333-3333-4333-8333-333333333333',

      tenantStatus:
        'suspended',

      role:
        'admin',

      status:
        'active',
    },

    {
      tenantId:
        '44444444-4444-4444-8444-444444444444',

      tenantStatus:
        'active',

      role:
        'member',

      status:
        'suspended',
    },
  ],
};

function createHandler(
  identity:
    AuthenticationIdentity | null,
  verificationResult = true,
): {
  readonly repository:
    InMemoryAuthenticationRepository;

  readonly passwordHasher:
    FakePasswordHasher;

  readonly handler:
    LoginHandler;
} {
  const repository =
    new InMemoryAuthenticationRepository(
      identity,
    );

  const passwordHasher =
    new FakePasswordHasher(
      verificationResult,
    );

  const handler =
    new LoginHandler({
      authenticationRepository:
        repository,

      passwordHasher,
    });

  return {
    repository,
    passwordHasher,
    handler,
  };
}

describe('LoginHandler', () => {
  it('authenticates a valid user', async () => {
    const {
      handler,
    } = createHandler(
      ACTIVE_IDENTITY,
    );

    const result =
      await handler.execute({
        email:
          '  LEO@EXAMPLE.COM  ',

        password:
          'uma senha longa e segura',
      });

    expect(result).toEqual({
      userId:
        '11111111-1111-4111-8111-111111111111',

      email:
        'Leo@Example.COM',

      displayName:
        'Leonardo',

      memberships: [
        {
          tenantId:
            '22222222-2222-4222-8222-222222222222',

          role:
            'owner',
        },
      ],
    });
  });

  it('looks up the identity using normalized email', async () => {
    const {
      handler,
      repository,
    } = createHandler(
      ACTIVE_IDENTITY,
    );

    await handler.execute({
      email:
        '  Leo@Example.COM  ',

      password:
        'uma senha longa e segura',
    });

    expect(
      repository.requestedEmails,
    ).toEqual([
      'leo@example.com',
    ]);
  });

  it('verifies the supplied password against the stored hash', async () => {
    const {
      handler,
      passwordHasher,
    } = createHandler(
      ACTIVE_IDENTITY,
    );

    await handler.execute({
      email:
        'leo@example.com',

      password:
        'uma senha longa e segura',
    });

    expect(
      passwordHasher.verifications,
    ).toEqual([
      {
        plainPassword:
          'uma senha longa e segura',

        passwordHash:
          '$argon2id$stored-password',
      },
    ]);
  });

  it('normalizes unicode before password verification', async () => {
    const {
      handler,
      passwordHasher,
    } = createHandler(
      ACTIVE_IDENTITY,
    );

    const password =
      'minha senha cafe\u0301 segura';

    await handler.execute({
      email:
        'leo@example.com',

      password,
    });

    expect(
      passwordHasher
        .verifications[0]
        ?.plainPassword,
    ).toBe(
      password.normalize('NFC'),
    );
  });

  it('rejects an incorrect password', async () => {
    const {
      handler,
    } = createHandler(
      ACTIVE_IDENTITY,
      false,
    );

    await expect(
      handler.execute({
        email:
          'leo@example.com',

        password:
          'senha incorreta',
      }),
    ).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );
  });

  it('performs password work when the email does not exist', async () => {
    const {
      handler,
      passwordHasher,
    } = createHandler(
      null,
    );

    await expect(
      handler.execute({
        email:
          'missing@example.com',

        password:
          'uma senha qualquer',
      }),
    ).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );

    expect(
      passwordHasher
        .hashedPasswords,
    ).toEqual([
      'uma senha qualquer',
    ]);

    expect(
      passwordHasher
        .verifications,
    ).toHaveLength(0);
  });

  it('rejects a disabled user even with a correct password', async () => {
    const identity:
      AuthenticationIdentity = {
        ...ACTIVE_IDENTITY,
        userStatus:
          'disabled',
      };

    const {
      handler,
      passwordHasher,
    } = createHandler(
      identity,
      true,
    );

    await expect(
      handler.execute({
        email:
          'leo@example.com',

        password:
          'uma senha longa e segura',
      }),
    ).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );

    expect(
      passwordHasher
        .verifications,
    ).toHaveLength(1);
  });

  it('returns only active memberships from active tenants', async () => {
    const {
      handler,
    } = createHandler(
      ACTIVE_IDENTITY,
    );

    const result =
      await handler.execute({
        email:
          'leo@example.com',

        password:
          'uma senha longa e segura',
      });

    expect(
      result.memberships,
    ).toEqual([
      {
        tenantId:
          '22222222-2222-4222-8222-222222222222',

        role:
          'owner',
      },
    ]);
  });

  it('does not apply the registration password length policy during login', async () => {
    const {
      handler,
      passwordHasher,
    } = createHandler(
      ACTIVE_IDENTITY,
    );

    await handler.execute({
      email:
        'leo@example.com',

      password:
        'legacy-pass',
    });

    expect(
      passwordHasher
        .verifications[0]
        ?.plainPassword,
    ).toBe(
      'legacy-pass',
    );
  });
});