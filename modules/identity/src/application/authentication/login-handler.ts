import {
  Email,
} from '../../domain/user/email.js';

import type {
  AuthenticationRepository,
} from '../ports/authentication-repository.js';

import type {
  PasswordHasher,
} from '../ports/password-hasher.js';

import {
  InvalidCredentialsError,
} from './invalid-credentials-error.js';

import type {
  LoginCommand,
} from './login-command.js';

import type {
  LoginResult,
} from './login-result.js';

export interface LoginHandlerDependencies {
  readonly authenticationRepository:
    AuthenticationRepository;

  readonly passwordHasher:
    PasswordHasher;
}

export class LoginHandler {
  constructor(
    private readonly dependencies:
      LoginHandlerDependencies,
  ) {}

  async execute(
    command: LoginCommand,
  ): Promise<LoginResult> {
    const email =
      Email.create(
        command.email,
      );

    /*
     * A normalização Unicode precisa
     * ser a mesma utilizada antes do
     * hashing durante o cadastro.
     *
     * Não usamos PasswordSecret.create()
     * aqui porque Login não deve aplicar
     * novamente a política atual de
     * criação de senhas.
     */
    const password =
      command.password
        .normalize('NFC');

    const identity =
      await this.dependencies
        .authenticationRepository
        .findByNormalizedEmail(
          email.normalizedValue,
        );

    if (
      identity === null
    ) {
      /*
       * Não encontrar usuário e retornar
       * instantaneamente produziria uma
       * diferença de tempo enorme em
       * relação a uma senha incorreta de
       * usuário existente.
       *
       * Executamos um hash e descartamos
       * o resultado para aproximar o custo
       * computacional dos dois caminhos.
       */
      await this.dependencies
        .passwordHasher
        .hash(password);

      throw new InvalidCredentialsError();
    }

    const passwordMatches =
      await this.dependencies
        .passwordHasher
        .verify(
          password,
          identity.passwordHash,
        );

    if (
      !passwordMatches
    ) {
      throw new InvalidCredentialsError();
    }

    /*
     * Fazemos a verificação de status
     * somente depois da senha.
     *
     * Assim também evitamos criar uma
     * diferença óbvia de comportamento
     * para contas desabilitadas.
     */
    if (
      identity.userStatus !==
      'active'
    ) {
      throw new InvalidCredentialsError();
    }

    const memberships =
      identity.memberships
        .filter(
          (membership) => {
            return (
              membership.status ===
                'active'
              &&
              membership.tenantStatus ===
                'active'
            );
          },
        )
        .map(
          (membership) => {
            return {
              tenantId:
                membership.tenantId,

              role:
                membership.role,
            };
          },
        );

    return {
      userId:
        identity.userId,

      email:
        identity.email,

      displayName:
        identity.displayName,

      memberships,
    };
  }
}