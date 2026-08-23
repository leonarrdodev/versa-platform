export class UserEmailAlreadyExistsError
extends Error {
  constructor() {
    super(
      'A user with this email already exists',
    );

    this.name =
      'UserEmailAlreadyExistsError';
  }
}