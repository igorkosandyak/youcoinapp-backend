export const SNS_TOPICS = {
  TRADE_SIGNALS: 'trade-signals',
  MARKET_LOG_COLLECTION: 'market-log-collection',
} as const;

export const SQS_QUEUES = {
  TRADE_SIGNALS: 'trade-signals-queue',
  MARKET_LOG_COLLECTION: 'market-log-collection-queue',
} as const;

export const SNS_TOPIC_DESCRIPTIONS = {
  [SNS_TOPICS.TRADE_SIGNALS]:
    'Trading signals and alerts from external sources',
  [SNS_TOPICS.MARKET_LOG_COLLECTION]:
    'Market log collection from external sources',
} as const;

export type SnsTopicKey = (typeof SNS_TOPICS)[keyof typeof SNS_TOPICS];
