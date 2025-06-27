export class ProfitableMarketLogsAnalysisJobDataDto {
  analysisType: 'daily' | 'on-demand';
  startDate?: string;
  endDate?: string;
  triggeredAt: string;

  constructor(
    analysisType: 'daily' | 'on-demand' = 'daily',
    startDate?: string,
    endDate?: string,
  ) {
    this.analysisType = analysisType;
    this.startDate = startDate;
    this.endDate = endDate;
    this.triggeredAt = new Date().toISOString();
  }
}
