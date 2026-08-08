import type {
  Uuid,
} from '@versa/shared-kernel';

export type LogLevel =
  | 'debug'
  | 'info'
  | 'warn'
  | 'error';

export interface StructuredLog {
  readonly timestamp: string;
  readonly level: LogLevel;
  readonly service: string;
  readonly message: string;

  readonly event?: string;

  readonly correlationId?: Uuid;
  readonly executionId?: Uuid;
  readonly causationId?: Uuid;

  readonly durationMs?: number;

  readonly data?: Readonly<
    Record<string, unknown>
  >;

  readonly error?: {
    readonly name: string;
    readonly message: string;
    readonly stack?: string;
  };
}