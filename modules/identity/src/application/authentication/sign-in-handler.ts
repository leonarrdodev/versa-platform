import type {
  LoginHandler,
} from './login-handler.js';

import type {
  CreateSessionHandler,
} from '../session/create-session-handler.js';

import type {
  LoginCommand,
} from './login-command.js';

import type {
  SignInResult,
} from './sign-in-result.js';

export interface SignInHandlerDependencies {
  readonly loginHandler:
    LoginHandler;

  readonly createSessionHandler:
    CreateSessionHandler;
}

export class SignInHandler {
  constructor(
    private readonly dependencies:
      SignInHandlerDependencies,
  ) {}

  async execute(
    command: LoginCommand,
  ): Promise<SignInResult> {
    const login =
      await this.dependencies
        .loginHandler
        .execute(
          command,
        );

    /*
     * Uma única empresa disponível:
     * selecionamos automaticamente.
     *
     * Nenhuma ou múltiplas:
     * a sessão nasce sem tenant ativo.
     *
     * No caso de múltiplas empresas,
     * futuramente o usuário escolherá
     * explicitamente qual deseja usar.
     */
    const activeTenantId =
      login.memberships.length === 1
        ? login.memberships[0]
            ?.tenantId ?? null
        : null;

    const session =
      await this.dependencies
        .createSessionHandler
        .execute({
          userId:
            login.userId,

          activeTenantId,
        });

    return {
      userId:
        login.userId,

      email:
        login.email,

      displayName:
        login.displayName,

      memberships:
        login.memberships,

      session: {
        id:
          session.sessionId,

        token:
          session.token,

        activeTenantId:
          session.activeTenantId,

        expiresAt:
          session.expiresAt,
      },
    };
  }
}