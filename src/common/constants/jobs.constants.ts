export const JOBS = {
  TRADE_SIGNAL_PROCESSOR: 'trade-signal-processor',
} as const;

export const JOB_OPTIONS = {
  removeOnComplete: 100,
  removeOnFail: 50,
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
} as const;
