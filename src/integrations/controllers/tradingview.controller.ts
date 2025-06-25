import { Controller, Post, Body, Logger } from '@nestjs/common';
import { SnsPublisherService } from '../../infrastructure/sns-publisher.service';
import { SNS_TOPICS } from '../../common/constants/messaging.constants';
import { AppResponse } from 'src/common/models/dtos/app-response.dto';
import { TradeSignalDto } from 'src/common/models/dtos/trade-signal.dto';

@Controller('tradingview')
export class TradingviewController {
  private readonly logger = new Logger(TradingviewController.name);

  constructor(private readonly snsPublisher: SnsPublisherService) {}

  @Post('webhooks/trade-signal')
  async onTradeSignal(
    @Body() signal: TradeSignalDto,
  ): Promise<AppResponse<TradeSignalDto>> {
    await this.snsPublisher.publish(SNS_TOPICS.TRADE_SIGNALS, signal);
    return new AppResponse(signal, 'Trade signal published to SNS');
  }
}
