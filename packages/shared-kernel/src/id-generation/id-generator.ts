import type { Uuid } from '../identifiers/uuid.js';

export interface IdGenerator {
  generate(): Uuid;
}