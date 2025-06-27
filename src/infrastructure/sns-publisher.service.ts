import { Injectable, Logger } from '@nestjs/common';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { ConfigService } from '@nestjs/config';
import {
  SNS_TOPICS,
  SnsTopicKey,
} from '../common/constants/messaging.constants';

@Injectable()
export class SnsPublisherService {
  private readonly logger = new Logger(SnsPublisherService.name);
  private readonly snsClient: SNSClient;
  private readonly topicMap: Partial<Record<SnsTopicKey, string>>;

  constructor(private config: ConfigService) {
    this.snsClient = new SNSClient({
      region: config.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: config.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: config.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });

    this.topicMap = {
      [SNS_TOPICS.TRADE_SIGNALS]: config.get<string>(
        'AWS_SNS_TRADE_SIGNALS_TOPIC',
      ),
      [SNS_TOPICS.MARKET_LOG_COLLECTION]: config.get<string>(
        'AWS_SNS_MARKET_LOG_COLLECTION_TOPIC',
      ),
      [SNS_TOPICS.PROFITABLE_MARKET_LOGS_ANALYSIS]: config.get<string>(
        'AWS_SNS_MARKET_LOG_ANALYSIS_TOPIC',
      ),
      // Add more topic mappings as needed
      // [SNS_TOPICS.MARKET_ALERT]: config.get<string>('AWS_SNS_MARKET_ALERTS_TOPIC'),
      // [SNS_TOPICS.USER_NOTIFICATION]: config.get<string>('AWS_SNS_USER_NOTIFICATIONS_TOPIC'),
    };
  }

  async publish(topicKey: SnsTopicKey, message: unknown): Promise<void> {
    const topicArn = this.topicMap[topicKey];
    if (!topicArn) {
      this.logger.error(`No SNS topic configured for key: ${topicKey}`);
      throw new Error(`Unknown SNS topic key: ${topicKey}`);
    }

    const payload =
      typeof message === 'string' ? message : JSON.stringify(message);

    const isFifo = topicArn.endsWith('.fifo');

    try {
      const command = new PublishCommand({
        TopicArn: topicArn,
        Message: payload,
        ...(isFifo && {
          MessageGroupId: 'trade-signals', // You can customize this
          MessageDeduplicationId: `msg-${Date.now()}-${Math.random()}`, // Simple deduplication
        }),
      });

      await this.snsClient.send(command);
      this.logger.log(`Published to [${topicKey}] topic.`);
    } catch (error) {
      this.logger.error(`Failed to publish to ${topicKey}`, error);
      throw error;
    }
  }

  /**
   * Get all configured topic keys
   */
  getConfiguredTopics(): SnsTopicKey[] {
    return Object.keys(this.topicMap) as SnsTopicKey[];
  }

  /**
   * Check if a topic is configured
   */
  isTopicConfigured(topicKey: SnsTopicKey): boolean {
    return !!this.topicMap[topicKey];
  }
}
