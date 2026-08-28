export class ActiveTenantRequiredError
extends Error {
  constructor() {
    super(
      'An active tenant is required',
    );

    this.name =
      'ActiveTenantRequiredError';
  }
}