export class InvalidValueError
extends TypeError {
  constructor(message: string) {
    super(message);

    this.name =
      'InvalidValueError';
  }
}