import { BaseMessageDto } from './base-message.dto';

export class ProfitableMarketLogsAnalysisJobDataDto extends BaseMessageDto {
  analysisType: 'daily' | 'on-demand';
  startDate?: string;
  endDate?: string;
  triggeredAt: string;

  constructor(
    analysisType: 'daily' | 'on-demand' = 'daily',
    startDate?: string,
    endDate?: string,
  ) {
    super('profitable-market-logs-analysis');
    this.analysisType = analysisType;
    this.startDate = startDate;
    this.endDate = endDate;
    this.triggeredAt = new Date().toISOString();
  }
}
