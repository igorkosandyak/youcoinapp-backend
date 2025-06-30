import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('dev', 'prod', 'test')
    .default('dev')
    .description('Application environment')
    .example('dev'),

  MONGO_DB_URI: Joi.string().uri().description('MongoDB connection URI').example('mongodb://localhost:27017/test-db'),

  PORT: Joi.number().integer().min(1).max(65535).default(3000).description('Application port').example(3000),

  TELEGRAM_ENABLED: Joi.boolean().default(false).description('Enable Telegram integration').example(false),

  REDIS_HOST: Joi.string().default('localhost').description('Redis server hostname').example('localhost'),

  REDIS_PORT: Joi.number().integer().min(1).max(65535).default(6379).description('Redis server port').example(6379),

  REDIS_PASSWORD: Joi.string().optional().allow('').description('Redis server password').example('your-redis-password'),

  REDIS_KEY_PREFIX: Joi.string().default('test:').description('Prefix for all cache keys').example('test:'),

  // Bull MQ Redis Configuration (separate from cache Redis)
  BULL_REDIS_HOST: Joi.string()
    .default('localhost')
    .description('Bull MQ Redis server hostname (for job queues)')
    .example('localhost'),

  BULL_REDIS_PORT: Joi.number()
    .integer()
    .min(1)
    .max(65535)
    .default(6379)
    .description('Bull MQ Redis server port (for job queues)')
    .example(6379),

  BULL_REDIS_PASSWORD: Joi.string()
    .optional()
    .allow('')
    .description('Bull MQ Redis password (for job queues)')
    .example('your-redis-password'),

  BULL_REDIS_DB: Joi.number()
    .integer()
    .min(0)
    .max(15)
    .default(1)
    .description('Bull MQ Redis database number (for job queues)')
    .example(1),

  AWS_ACCESS_KEY_ID: Joi.string().length(20).description('AWS Access Key ID').example('your-aws-access-key-id'),

  AWS_SECRET_ACCESS_KEY: Joi.string()
    .min(40)
    .max(40)
    .description('AWS Secret Access Key')
    .example('your-aws-secret-access-key-40-characters-long'),

  AWS_REGION: Joi.string()
    .valid(
      'us-east-1',
      'us-east-2',
      'us-west-1',
      'us-west-2',
      'af-south-1',
      'ap-east-1',
      'ap-south-1',
      'ap-northeast-1',
      'ap-northeast-2',
      'ap-northeast-3',
      'ap-southeast-1',
      'ap-southeast-2',
      'ap-southeast-3',
      'ap-southeast-4',
      'ca-central-1',
      'eu-central-1',
      'eu-west-1',
      'eu-west-2',
      'eu-west-3',
      'eu-north-1',
      'eu-south-1',
      'eu-south-2',
      'me-south-1',
      'me-central-1',
      'sa-east-1',
      'us-gov-east-1',
      'us-gov-west-1',
    )
    .default('us-east-1')
    .description('AWS Region')
    .example('us-east-1'),

  AWS_SNS_TRADE_SIGNALS_TOPIC: Joi.string()
    .default('arn:aws:sns:us-east-1:ACCOUNT_ID:trade-signals')
    .description('AWS SNS trade signals topic')
    .example('arn:aws:sns:us-east-1:ACCOUNT_ID:trade-signals'),

  AWS_SNS_MARKET_LOG_COLLECTION_TOPIC: Joi.string()
    .default('arn:aws:sns:us-east-1:ACCOUNT_ID:market-log-collection')
    .description('AWS SNS market log collection topic')
    .example('arn:aws:sns:us-east-1:ACCOUNT_ID:market-log-collection'),

  AWS_SNS_MARKET_LOG_ANALYSIS_TOPIC: Joi.string()
    .default('arn:aws:sns:us-east-1:ACCOUNT_ID:profitable-market-logs-analysis')
    .description('AWS SNS profitable market logs analysis topic')
    .example('arn:aws:sns:us-east-1:ACCOUNT_ID:profitable-market-logs-analysis'),

  AWS_SQS_TRADE_SIGNALS_URL: Joi.string()
    .uri()
    .description('AWS SQS trade signals queue URL')
    .example('https://sqs.us-east-1.amazonaws.com/ACCOUNT_ID/trade-signals-queue'),

  AWS_SQS_DLQ_TRADE_SIGNALS_URL: Joi.string()
    .uri()
    .description('AWS SQS dead letter queue for trade signals')
    .example('https://sqs.us-east-1.amazonaws.com/ACCOUNT_ID/trade-signals-dlq'),

  AWS_SQS_MARKET_LOG_COLLECTION_URL: Joi.string()
    .uri()
    .description('AWS SQS market log collection queue URL')
    .example('https://sqs.us-east-1.amazonaws.com/ACCOUNT_ID/market-log-collection-queue'),

  AWS_SQS_MARKET_LOG_ANALYSIS_URL: Joi.string()
    .uri()
    .description('AWS SQS profitable market logs analysis queue URL')
    .example('https://sqs.us-east-1.amazonaws.com/ACCOUNT_ID/profitable-market-logs-analysis-queue'),

  AWS_SQS_DLQ_MARKET_LOG_COLLECTION_URL: Joi.string()
    .uri()
    .description('AWS SQS dead letter queue for market log collection')
    .example('https://sqs.us-east-1.amazonaws.com/ACCOUNT_ID/market-log-collection-dlq'),

  MARKET_LOGS_COLLECTION_INTERVAL: Joi.number()
    .integer()
    .min(1)
    .max(60)
    .default(3)
    .description('Market logs collection interval in minutes')
    .example(3),
});

export const validationOptions = {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true,
};
