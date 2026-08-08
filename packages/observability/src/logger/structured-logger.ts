import type {
  Clock,
} from '@versa/shared-kernel';

import type {
  ExecutionContext,
} from '../context/execution-context.js';

import type {
  LogInput,
  Logger,
  LogSink,
} from './logger.js';

import type {
  LogLevel,
  StructuredLog,
} from './structured-log.js';

function normalizeError(
  error: unknown,
): StructuredLog['error'] | undefined {
  if (error === undefined) {
    return undefined;
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      ...(error.stack === undefined
        ? {}
        : {
            stack: error.stack,
          }),
    };
  }

  return {
    name: 'UnknownError',
    message: String(error),
  };
}

function contextFields(
  context: ExecutionContext | undefined,
): Pick<
  StructuredLog,
  | 'correlationId'
  | 'executionId'
  | 'causationId'
> {
  if (context === undefined) {
    return {};
  }

  return {
    correlationId:
      context.correlationId,

    executionId:
      context.executionId,

    ...(context.causationId === undefined
      ? {}
      : {
          causationId:
            context.causationId,
        }),
  };
}

export class StructuredLogger
implements Logger {
  constructor(
    private readonly service: string,
    private readonly clock: Clock,
    private readonly sink: LogSink,
  ) {}

  log(
    level: LogLevel,
    input: LogInput,
  ): void {
    const normalizedError =
      normalizeError(input.error);

    const log: StructuredLog = {
      timestamp:
        this.clock.now().toISOString(),

      level,
      service: this.service,
      message: input.message,

      ...contextFields(
        input.context,
      ),

      ...(input.event === undefined
        ? {}
        : {
            event: input.event,
          }),

      ...(input.durationMs === undefined
        ? {}
        : {
            durationMs:
              input.durationMs,
          }),

      ...(input.data === undefined
        ? {}
        : {
            data: input.data,
          }),

      ...(normalizedError === undefined
        ? {}
        : {
            error: normalizedError,
          }),
    };

    this.sink(log);
  }

  debug(input: LogInput): void {
    this.log('debug', input);
  }

  info(input: LogInput): void {
    this.log('info', input);
  }

  warn(input: LogInput): void {
    this.log('warn', input);
  }

  error(input: LogInput): void {
    this.log('error', input);
  }
}