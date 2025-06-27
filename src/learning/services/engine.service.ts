import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { LabelingService } from './labeling.service';
import { MarketLog } from 'src/common/models/entities/market-log.entity';

@Injectable()
export class EngineService implements OnModuleInit {
  private readonly logger = new Logger(EngineService.name);

  constructor(private readonly labelingService: LabelingService) {}

  async onModuleInit(): Promise<void> {
    // const bestProfitableLogs: MarketLog[] =
    //   await this.labelingService.analyzeAndGetBestProfitableLogs();
    // this.logger.log(
    //   `Engine initialization complete. Found ${bestProfitableLogs.length} best profitable logs per asset from the last 24 hours.`,
    // );
    // if (bestProfitableLogs.length > 0) {
    //   this.logger.log('Top profitable opportunities from the last 24 hours:');
    //   bestProfitableLogs.slice(0, 10).forEach((log, index) => {
    //     const timeInfo = (log as any).timeToReach
    //       ? ` (reached in ${(log as any).timeToReach})`
    //       : '';
    //     this.logger.log(
    //       `${index + 1}. ${log.from}: ${log.maxPriceChangePercent.toFixed(2)}%${timeInfo} at ${log.createdAt}`,
    //     );
    //   });
    // } else {
    //   this.logger.log(
    //     'No profitable opportunities found in the last 24 hours.',
    //   );
    // }
  }
}
