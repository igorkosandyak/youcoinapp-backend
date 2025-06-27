import {
  Controller,
  Get,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MarketLogStatusService } from '../market-logs/services/market-log-status.service';

@Controller('market-logs')
export class MarketLogStatusController {
  constructor(
    private readonly marketLogStatusService: MarketLogStatusService,
  ) {}

  @Get('v1/stats')
  async getCollectionStats() {
    return await this.marketLogStatusService.getCollectionStats();
  }

  @Get('v1/stats/:exchangeName')
  async getExchangeStatus(@Param('exchangeName') exchangeName: string) {
    return await this.marketLogStatusService.getExchangeStatus(exchangeName);
  }

  @Delete('v1/stats/:exchangeName/rate-limit')
  @HttpCode(HttpStatus.OK)
  async clearRateLimit(@Param('exchangeName') exchangeName: string) {
    return await this.marketLogStatusService.clearRateLimit(exchangeName);
  }
}
