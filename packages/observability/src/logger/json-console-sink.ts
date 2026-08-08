import type {
  LogSink,
} from './logger.js';

export const jsonConsoleSink: LogSink = (
  log,
): void => {
  process.stdout.write(
    `${JSON.stringify(log)}\n`,
  );
};