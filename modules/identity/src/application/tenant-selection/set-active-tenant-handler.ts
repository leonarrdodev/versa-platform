import {
  parseTenantId,
} from '../../domain/identifiers/tenant-id.js';

import type {
  TenantSelectionRepository,
} from '../ports/tenant-selection-repository.js';

import {
  ActiveTenantNotAllowedError,
} from './active-tenant-not-allowed-error.js';

export interface SetActiveTenantCommand {
  readonly sessionId:
    string;

  readonly userId:
    string;

  readonly tenantId:
    string;
}

export interface SetActiveTenantHandlerDependencies {
  readonly repository:
    TenantSelectionRepository;
}

export class SetActiveTenantHandler {
  constructor(
    private readonly dependencies:
      SetActiveTenantHandlerDependencies,
  ) {}

  async execute(
    command:
      SetActiveTenantCommand,
  ): Promise<void> {
    /*
     * Primeiro validamos a estrutura
     * do tenantId pelo próprio domínio.
     */
    const tenantId =
      parseTenantId(
        command.tenantId,
      );

    const updated =
      await this.dependencies
        .repository
        .setActiveTenant({
          sessionId:
            command.sessionId,

          userId:
            command.userId,

          tenantId,
        });

    if (
      !updated
    ) {
      throw new ActiveTenantNotAllowedError();
    }
  }
}