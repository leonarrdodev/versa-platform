import type {
  IdGenerator,
  Uuid,
} from '@versa/shared-kernel';

export interface ExecutionContext {
  readonly correlationId: Uuid;
  readonly executionId: Uuid;
  readonly causationId?: Uuid;
}

export function createRootExecutionContext(
  idGenerator: IdGenerator,
): ExecutionContext {
  return {
    correlationId: idGenerator.generate(),
    executionId: idGenerator.generate(),
  };
}

export function createChildExecutionContext(
  parent: ExecutionContext,
  idGenerator: IdGenerator,
  causationId: Uuid = parent.executionId,
): ExecutionContext {
  return {
    correlationId: parent.correlationId,
    executionId: idGenerator.generate(),
    causationId,
  };
}