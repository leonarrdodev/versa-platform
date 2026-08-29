import type {
  TenantSelectionRepository,
} from '../ports/tenant-selection-repository.js';

import type {
  AvailableTenant,
} from './available-tenant.js';

export interface ListAvailableTenantsCommand {
  readonly userId:
    string;
}

export interface ListAvailableTenantsHandlerDependencies {
  readonly repository:
    TenantSelectionRepository;
}

export class ListAvailableTenantsHandler {
  constructor(
    private readonly dependencies:
      ListAvailableTenantsHandlerDependencies,
  ) {}

  async execute(
    command:
      ListAvailableTenantsCommand,
  ): Promise<
    readonly AvailableTenant[]
  > {
    return this.dependencies
      .repository
      .listAvailableTenants(
        command.userId,
      );
  }
}