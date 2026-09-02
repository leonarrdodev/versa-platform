export class CategoryNameAlreadyExistsError
extends Error {
  constructor() {
    super(
      'A category with this name already exists',
    );

    this.name =
      'CategoryNameAlreadyExistsError';
  }
}