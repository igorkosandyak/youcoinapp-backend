export const SNS_TOPICS = {
  TRADE_SIGNALS: 'trade-signals',
  MARKET_LOG_COLLECTION: 'market-log-collection',
  PROFITABLE_MARKET_LOGS_ANALYSIS: 'market-log-analysis',
} as const;

export const SQS_QUEUES = {
  TRADE_SIGNALS: 'trade-signals-queue',
  MARKET_LOG_COLLECTION: 'market-log-collection-queue',
  PROFITABLE_MARKET_LOGS_ANALYSIS: 'profitable-market-logs-analysis-queue',
} as const;

export const SNS_TOPIC_DESCRIPTIONS = {
  [SNS_TOPICS.TRADE_SIGNALS]:
    'Trading signals and alerts from external sources',
  [SNS_TOPICS.MARKET_LOG_COLLECTION]:
    'Market log collection from external sources',
  [SNS_TOPICS.PROFITABLE_MARKET_LOGS_ANALYSIS]:
    'Profitable market logs analysis for learning and ML training',
} as const;

export type SnsTopicKey = (typeof SNS_TOPICS)[keyof typeof SNS_TOPICS];
