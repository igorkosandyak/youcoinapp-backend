import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ProfitableMarketLogsAnalysisSchedulerService } from '../profitable-market-logs-analysis.scheduler';
import { AppResponse } from 'src/common/models/dtos/app-response.dto';

interface TriggerAnalysisDto {
  startDate?: string;
  endDate?: string;
}

@Controller('learning/profitable-market-logs-analysis')
export class ProfitableMarketLogsAnalysisController {
  private readonly logger = new Logger(ProfitableMarketLogsAnalysisController.name);

  constructor(private readonly analysisScheduler: ProfitableMarketLogsAnalysisSchedulerService) {}

  @Post('trigger')
  async triggerAnalysis(@Body() body: TriggerAnalysisDto): Promise<AppResponse<{ message: string }>> {
    try {
      const { startDate, endDate } = body;

      this.logger.log(`🚀 Manual trigger of profitable market logs analysis requested`);

      if (startDate && endDate) {
        this.logger.log(`📅 Date range: ${startDate} to ${endDate}`);
        await this.analysisScheduler.triggerOnDemandAnalysis(startDate, endDate);
      } else {
        this.logger.log(`📅 Using default daily analysis`);
        await this.analysisScheduler.triggerOnDemandAnalysis();
      }

      return new AppResponse(
        { message: 'Profitable market logs analysis triggered successfully' },
        'Analysis job queued for processing',
      );
    } catch (error) {
      this.logger.error('❌ Error triggering analysis:', error);
      throw error;
    }
  }

  @Post('trigger/daily')
  async triggerDailyAnalysis(): Promise<AppResponse<{ message: string }>> {
    try {
      this.logger.log(`🚀 Manual trigger of daily profitable market logs analysis requested`);

      await this.analysisScheduler.triggerDailyAnalysis();

      return new AppResponse(
        {
          message: 'Daily profitable market logs analysis triggered successfully',
        },
        'Daily analysis job queued for processing',
      );
    } catch (error) {
      this.logger.error('❌ Error triggering daily analysis:', error);
      throw error;
    }
  }
}
