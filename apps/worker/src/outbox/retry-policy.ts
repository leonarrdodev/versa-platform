export interface OutboxRetryPolicy {
  readonly maxAttempts:
    number;

  readonly baseDelayMs:
    number;

  readonly maxDelayMs:
    number;
}

export interface RetryDecision {
  readonly attempt:
    number;

  readonly deadLetter:
    boolean;

  readonly nextDelayMs:
    number | null;
}

export function decideOutboxRetry(
  processingAttempts: number,
  policy: OutboxRetryPolicy,
): RetryDecision {
  const attempt =
    processingAttempts + 1;

  if (
    attempt >=
    policy.maxAttempts
  ) {
    return {
      attempt,

      deadLetter:
        true,

      nextDelayMs:
        null,
    };
  }

  const exponentialDelay =
    policy.baseDelayMs *
    2 ** (attempt - 1);

  const nextDelayMs =
    Math.min(
      exponentialDelay,
      policy.maxDelayMs,
    );

  return {
    attempt,

    deadLetter:
      false,

    nextDelayMs,
  };
}