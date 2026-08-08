import type {
  ExecutionContext,
} from '../context/execution-context.js';

import type {
  LogLevel,
  StructuredLog,
} from './structured-log.js';

export interface LogInput {
  readonly message: string;
  readonly event?: string;
  readonly context?: ExecutionContext;
  readonly durationMs?: number;

  readonly data?: Readonly<
    Record<string, unknown>
  >;

  readonly error?: unknown;
}

export interface Logger {
  log(
    level: LogLevel,
    input: LogInput,
  ): void;

  debug(input: LogInput): void;

  info(input: LogInput): void;

  warn(input: LogInput): void;

  error(input: LogInput): void;
}

export type LogSink = (
  log: StructuredLog,
) => void;