# Profitable Market Logs Analysis

This document describes the implementation of profitable market logs analysis using Bull MQ with SNS and SQS, following the same pattern as market logs collection and trading signals processing.

## Overview

The profitable market logs analysis system automatically analyzes market logs to identify profitable trading opportunities and collects the best profitable logs per asset for machine learning training and analysis.

## Architecture

### Components

1. **Scheduler Service** (`ProfitableMarketLogsAnalysisSchedulerService`)
   - Triggers daily analysis automatically every 24 hours
   - Provides on-demand analysis triggering capabilities

2. **Consumer Service** (`ProfitableMarketLogsAnalysisConsumerService`)
   - Listens to SQS messages from the profitable market logs analysis queue
   - Converts SNS/SQS messages to Bull MQ jobs

3. **Processor Service** (`ProfitableMarketLogsAnalysisProcessor`)
   - Executes the actual profitability analysis
   - Uses the existing `LabelingService` to analyze market logs
   - Processes jobs with concurrency of 5

4. **Controller** (`ProfitableMarketLogsAnalysisController`)
   - Provides HTTP endpoints for manual triggering
   - Supports both daily and custom date range analysis

### Message Flow

```
Scheduler → SNS → SQS → Consumer → Bull MQ → Processor → LabelingService
```

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# SNS Topics
AWS_SNS_PROFITABLE_MARKET_LOGS_ANALYSIS_TOPIC=arn:aws:sns:us-east-1:ACCOUNT_ID:profitable-market-logs-analysis

# SQS Queues
AWS_SQS_PROFITABLE_MARKET_LOGS_ANALYSIS_URL=https://sqs.us-east-1.amazonaws.com/ACCOUNT_ID/profitable-market-logs-analysis-queue
```

### AWS Resources Required

1. **SNS Topic**: `profitable-market-logs-analysis`
2. **SQS Queue**: `profitable-market-logs-analysis-queue`
3. **SQS Dead Letter Queue**: `profitable-market-logs-analysis-dlq` (optional)

## Usage

### Automatic Daily Analysis

The system automatically runs profitability analysis every 24 hours. No manual intervention required.

### Manual Triggering

#### Trigger Daily Analysis

```bash
curl -X POST http://localhost:3000/learning/profitable-market-logs-analysis/trigger/daily
```

#### Trigger Custom Analysis

```bash
curl -X POST http://localhost:3000/learning/profitable-market-logs-analysis/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-02T00:00:00Z"
  }'
```

### API Endpoints

- `POST /learning/profitable-market-logs-analysis/trigger/daily` - Trigger daily analysis
- `POST /learning/profitable-market-logs-analysis/trigger` - Trigger custom analysis

## Analysis Process

1. **Data Collection**: Fetches unchecked market logs from the last 24 hours
2. **Profitability Calculation**: For each log, calculates the maximum price change within a 24-hour window
3. **Threshold Filtering**: Identifies logs that meet the profit threshold (default: 2.0%)
4. **Asset Grouping**: Groups profitable logs by asset
5. **Best Selection**: Selects the log with the highest price change per asset
6. **Database Update**: Updates the original logs with profitability data
7. **Result Logging**: Logs the top profitable opportunities

## Configuration Options

### Analysis Parameters

The analysis can be configured in the `LabelingService`:

```typescript
private readonly analysisConfig: AnalysisConfig = {
  MAX_HOURS_TO_CHECK: 24,        // Time window for analysis
  PROFIT_THRESHOLD_PERCENT: 2.0, // Minimum profit percentage
  BATCH_SIZE: 400,               // Batch size for processing
};
```

### Queue Configuration

```typescript
[JOBS.PROFITABLE_MARKET_LOGS_ANALYSIS_PROCESSOR]: {
  defaultJobOptions: JOB_OPTIONS,
  concurrency: 5, // Process 5 jobs in parallel
}
```

## Monitoring

### Logs

The system provides comprehensive logging:

- Scheduler triggers and status
- SQS message processing
- Bull MQ job progress
- Analysis results and statistics
- Error handling and retries

### Job Progress

Jobs report progress at key milestones:

- 10%: Job started
- 80%: Analysis completed
- 100%: Job finished

### Error Handling

- Automatic retries with exponential backoff
- Dead letter queue for failed messages
- Comprehensive error logging
- Graceful degradation

## Integration with Existing Systems

### LabelingService Integration

The processor uses the existing `LabelingService` which provides:

- `analyzeMarketLogsProfitability()` - Main analysis method
- `getBestProfitableLogsPerAsset()` - Retrieves best logs
- `analyzeAndGetBestProfitableLogs()` - Combined analysis and retrieval

### Database Integration

The analysis updates the `MarketLog` collection with:

- `wasProfitable`: Boolean flag
- `maxPriceChangePercent`: Maximum price change percentage
- `profitabilityCheckedAt`: Timestamp of analysis
- `timeToReach`: Time to reach maximum profit

## Performance Considerations

- **Batch Processing**: Processes logs in batches of 400
- **Concurrent Processing**: 5 concurrent jobs
- **Rate Limiting**: Built-in delays between database operations
- **Memory Management**: Processes logs in chunks to avoid memory issues

## Security

- All AWS credentials are managed through environment variables
- SNS/SQS use IAM roles and policies
- No sensitive data is logged
- Input validation on API endpoints

## Troubleshooting

### Common Issues

1. **SQS Message Not Received**
   - Check SQS queue URL configuration
   - Verify SNS topic subscription
   - Check AWS credentials and permissions

2. **Analysis Not Completing**
   - Check database connectivity
   - Verify market log data availability
   - Review error logs for specific issues

3. **High Memory Usage**
   - Reduce batch size in configuration
   - Check for memory leaks in processing
   - Monitor concurrent job count

### Debug Mode

Enable debug logging by setting the log level to debug in your application configuration.

## Future Enhancements

1. **Custom Date Ranges**: Enhanced support for historical analysis
2. **Real-time Analysis**: Near real-time profitability analysis
3. **ML Integration**: Direct integration with machine learning models
4. **Performance Metrics**: Detailed performance analytics
5. **Alerting**: Notifications for high-profit opportunities
