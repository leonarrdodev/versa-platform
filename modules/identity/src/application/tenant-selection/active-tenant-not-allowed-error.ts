export class ActiveTenantNotAllowedError
extends Error {
  constructor() {
    super(
      'Active tenant is not allowed for this session',
    );

    this.name =
      'ActiveTenantNotAllowedError';
  }
}