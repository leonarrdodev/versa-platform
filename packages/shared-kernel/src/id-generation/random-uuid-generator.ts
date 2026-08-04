import { randomUUID } from 'node:crypto';

import { parseUuid } from '../identifiers/uuid.js';
import type { Uuid } from '../identifiers/uuid.js';
import type { IdGenerator } from './id-generator.js';

export class RandomUuidGenerator implements IdGenerator {
  generate(): Uuid {
    return parseUuid(randomUUID());
  }
}