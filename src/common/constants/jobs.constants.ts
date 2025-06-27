export const JOBS = {
  TRADE_SIGNAL_PROCESSOR: 'trade-signal-processor',
  MARKET_LOG_COLLECTION_PROCESSOR: 'market-log-collection-processor',
  PROFITABLE_MARKET_LOGS_ANALYSIS_PROCESSOR:
    'profitable-market-logs-analysis-processor',
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

export const QUEUE_CONFIGS = {
  [JOBS.TRADE_SIGNAL_PROCESSOR]: {
    defaultJobOptions: JOB_OPTIONS,
    concurrency: 1, // Process trade signals sequentially for safety
  },
  [JOBS.MARKET_LOG_COLLECTION_PROCESSOR]: {
    defaultJobOptions: JOB_OPTIONS,
    concurrency: 10, // Process market log collection in parallel
  },
  [JOBS.PROFITABLE_MARKET_LOGS_ANALYSIS_PROCESSOR]: {
    defaultJobOptions: JOB_OPTIONS,
    concurrency: 5, // Process profitability analysis in parallel
  },
} as const;
