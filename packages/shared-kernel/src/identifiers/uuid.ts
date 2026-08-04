declare const uuidBrand: unique symbol;

export type Uuid = string & {
  readonly [uuidBrand]: true;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): value is Uuid {
  return UUID_PATTERN.test(value);
}

export function parseUuid(value: string): Uuid {
  if (!isUuid(value)) {
    throw new TypeError(`Invalid UUID: ${value}`);
  }

  return value.toLowerCase() as Uuid;
}