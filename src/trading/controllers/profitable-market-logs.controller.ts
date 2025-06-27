import {
  Controller,
  Get,
  Query,
  Param,
  Logger,
  Post,
  Body,
} from '@nestjs/common';
import { ProfitableMarketLogCreatorService } from '../market-logs/services/profitable-market-log-creator.service';
import { MarketLogCreatorService } from '../market-logs/services/market-log-creator.service';
import { AppResponse } from 'src/common/models/dtos/app-response.dto';

@Controller('trading/profitable-market-logs')
export class ProfitableMarketLogsController {
  private readonly logger = new Logger(ProfitableMarketLogsController.name);

  constructor(
    private readonly profitableMarketLogCreatorService: ProfitableMarketLogCreatorService,
    private readonly marketLogCreatorService: MarketLogCreatorService,
  ) {}

  @Get('stats')
  async getStats(): Promise<
    AppResponse<{
      totalCount: number;
      averageProfitability: number;
      topAsset: string;
      topProfitability: number;
    }>
  > {
    try {
      const stats =
        await this.profitableMarketLogCreatorService.getProfitableLogsStats();
      return new AppResponse(
        stats,
        'Profitable market logs statistics retrieved successfully',
      );
    } catch (error) {
      this.logger.error('Error getting profitable market logs stats:', error);
      throw error;
    }
  }

  @Get('top')
  async getTopProfitableLogs(
    @Query('limit') limit: string = '10',
  ): Promise<AppResponse<any[]>> {
    try {
      const limitNumber = parseInt(limit, 10) || 10;
      const topLogs =
        await this.profitableMarketLogCreatorService.findTopProfitableLogs(
          limitNumber,
        );
      return new AppResponse(
        topLogs,
        `Top ${topLogs.length} profitable market logs retrieved successfully`,
      );
    } catch (error) {
      this.logger.error('Error getting top profitable market logs:', error);
      throw error;
    }
  }

  @Get('asset/:asset')
  async getProfitableLogsByAsset(
    @Param('asset') asset: string,
  ): Promise<AppResponse<any[]>> {
    try {
      const logs =
        await this.profitableMarketLogCreatorService.findProfitableLogsByAsset(
          asset,
        );
      return new AppResponse(
        logs,
        `Profitable market logs for ${asset} retrieved successfully`,
      );
    } catch (error) {
      this.logger.error(
        `Error getting profitable market logs for ${asset}:`,
        error,
      );
      throw error;
    }
  }

  @Get('date-range')
  async getProfitableLogsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<AppResponse<any[]>> {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error(
          'Invalid date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)',
        );
      }

      const logs =
        await this.profitableMarketLogCreatorService.findProfitableLogsByDateRange(
          start,
          end,
        );
      return new AppResponse(
        logs,
        `Profitable market logs for date range retrieved successfully`,
      );
    } catch (error) {
      this.logger.error(
        'Error getting profitable market logs by date range:',
        error,
      );
      throw error;
    }
  }

  @Get('cleanup')
  async cleanupOldLogs(
    @Query('olderThanDays') olderThanDays: string = '30',
  ): Promise<AppResponse<{ deletedCount: number }>> {
    try {
      const days = parseInt(olderThanDays, 10) || 30;
      const deletedCount =
        await this.profitableMarketLogCreatorService.cleanupOldProfitableLogs(
          days,
        );
      return new AppResponse(
        { deletedCount },
        `Cleaned up ${deletedCount} old profitable market logs (older than ${days} days)`,
      );
    } catch (error) {
      this.logger.error('Error cleaning up old profitable market logs:', error);
      throw error;
    }
  }

  @Post('clear-profitability-data')
  async clearProfitabilityData(
    @Body() body: { fromDate?: string; toDate?: string; asset?: string },
  ): Promise<AppResponse<{ updatedCount: number }>> {
    try {
      const { fromDate, toDate, asset } = body;

      let fromDateObj: Date | undefined;
      let toDateObj: Date | undefined;

      if (fromDate) {
        fromDateObj = new Date(fromDate);
        if (isNaN(fromDateObj.getTime())) {
          throw new Error(
            'Invalid fromDate format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)',
          );
        }
      }

      if (toDate) {
        toDateObj = new Date(toDate);
        if (isNaN(toDateObj.getTime())) {
          throw new Error(
            'Invalid toDate format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)',
          );
        }
      }

      const result = await this.marketLogCreatorService.clearProfitabilityData(
        fromDateObj,
        toDateObj,
        asset,
      );

      return new AppResponse(
        result,
        `Successfully cleared profitability data for ${result.updatedCount} market logs`,
      );
    } catch (error) {
      this.logger.error('Error clearing profitability data:', error);
      throw error;
    }
  }

  @Post('clear-all-profitability-data')
  async clearAllProfitabilityData(): Promise<
    AppResponse<{ updatedCount: number }>
  > {
    try {
      const result =
        await this.marketLogCreatorService.clearAllProfitabilityData();

      return new AppResponse(
        result,
        `Successfully cleared ALL profitability data for ${result.updatedCount} market logs`,
      );
    } catch (error) {
      this.logger.error('Error clearing all profitability data:', error);
      throw error;
    }
  }
}
