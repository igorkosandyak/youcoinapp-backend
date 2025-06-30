# Profitable Market Logs Analysis System

This document describes the profitable market logs analysis system that identifies and stores profitable trading opportunities from market logs.

## Overview

The system analyzes market logs from the last 24 hours to identify profitable trading opportunities. It uses the `LabelingService` to calculate maximum price changes and determine profitability based on configurable thresholds. Profitable market logs are then saved to a dedicated `profitable-market-logs` collection for easy querying and analysis.

## Architecture

### Components

1. **ProfitableMarketLogsAnalysisConsumer** - Handles SQS messages and queues Bull MQ jobs
2. **ProfitableMarketLogsAnalysisProcessor** - Processes jobs and performs analysis using `LabelingService`
3. **ProfitableMarketLogsAnalysisScheduler** - Triggers daily and on-demand analysis via SNS
4. **ProfitableMarketLogsAnalysisController** - HTTP endpoints for manual triggering
5. **ProfitableMarketLogCreatorService** - Saves profitable market logs to dedicated collection
6. **ProfitableMarketLogRepository** - Database operations for profitable market logs

### Data Flow

```
SNS Topic → SQS Queue → Consumer → Bull MQ Queue → Processor → LabelingService → ProfitableMarketLogCreatorService → MongoDB Collection
```

## Configuration

### Environment Variables

```bash
# SNS Topic for triggering analysis
AWS_SNS_MARKET_LOG_ANALYSIS_TOPIC=arn:aws:sns:region:account:market-log-analysis-topic

# SQS Queue for receiving messages
AWS_SQS_MARKET_LOG_ANALYSIS_URL=https://sqs.region.amazonaws.com/account/market-log-analysis-queue

# Redis for Bull MQ
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

### Analysis Configuration

The analysis uses the following configuration in `LabelingService`:

- **MAX_HOURS_TO_CHECK**: 24 hours (time window for analysis)
- **PROFIT_THRESHOLD_PERCENT**: 2.0% (minimum profit threshold)
- **BATCH_SIZE**: 400 (batch size for processing logs)

## Database Schema

### ProfitableMarketLog Entity

The `profitable-market-logs` collection contains all the same fields as the original `market-logs` collection, plus additional profitability-specific fields:

```typescript
interface ProfitableMarketLog {
  // All original MarketLog fields...

  // Profitability-specific fields
  wasProfitable: boolean;
  maxPriceChangePercent: number;
  profitabilityCheckedAt: Date;
  timeToReach: string;

  // Analysis metadata
  analysisDate: Date;
  analysisType: string; // 'daily' or 'on-demand'
  originalMarketLogId: string; // Reference to original market log

  // Vector data for ML analysis
  vectorData: number[];
}
```

## Usage

### Automatic Daily Analysis

The system automatically runs daily analysis at 00:00 UTC via the scheduler:

```typescript
// Triggered automatically by ProfitableMarketLogsAnalysisScheduler
await this.snsPublisherService.publish(MESSAGING.PROFITABLE_MARKET_LOGS_ANALYSIS, {
  analysisType: 'daily',
});
```

### Manual On-Demand Analysis

Trigger analysis manually via HTTP endpoint:

```bash
# Daily analysis (last 24 hours)
curl -X POST http://localhost:3000/learning/profitable-market-logs-analysis/daily

# Custom date range analysis
curl -X POST http://localhost:3000/learning/profitable-market-logs-analysis/on-demand \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-02T00:00:00.000Z"
  }'
```

### Querying Profitable Market Logs

The system provides HTTP endpoints to query the profitable market logs collection:

```bash
# Get statistics
curl http://localhost:3000/trading/profitable-market-logs/stats

# Get top profitable logs
curl http://localhost:3000/trading/profitable-market-logs/top?limit=20

# Get profitable logs by asset
curl http://localhost:3000/trading/profitable-market-logs/asset/BTCUSDT

# Get profitable logs by date range
curl "http://localhost:3000/trading/profitable-market-logs/date-range?startDate=2024-01-01T00:00:00.000Z&endDate=2024-01-02T00:00:00.000Z"

# Clean up old logs (older than 30 days)
curl http://localhost:3000/trading/profitable-market-logs/cleanup?olderThanDays=30
```

## API Endpoints

### Learning Module Endpoints

- `POST /learning/profitable-market-logs-analysis/daily` - Trigger daily analysis
- `POST /learning/profitable-market-logs-analysis/on-demand` - Trigger custom analysis

### Trading Module Endpoints

- `GET /trading/profitable-market-logs/stats` - Get collection statistics
- `GET /trading/profitable-market-logs/top?limit=10` - Get top profitable logs
- `GET /trading/profitable-market-logs/asset/:asset` - Get logs by asset
- `GET /trading/profitable-market-logs/date-range` - Get logs by date range
- `GET /trading/profitable-market-logs/cleanup` - Clean up old logs

## Monitoring and Logging

### Job Monitoring

Monitor Bull MQ jobs via Redis:

```bash
# Check job status
redis-cli HGETALL bull:profitable-market-logs-analysis:jobs

# Check queue status
redis-cli LLEN bull:profitable-market-logs-analysis:wait
```

### Log Analysis

The system logs detailed information about:

- Analysis start/completion
- Number of profitable logs found
- Top profitable opportunities
- Database operations
- Error conditions

Example logs:

```
[ProfitableMarketLogsAnalysisProcessor] 🔄 [job-123] Starting profitable market logs analysis: daily
[LabelingService] Analyzing market logs profitability for the last 24 hours
[ProfitableMarketLogsAnalysisProcessor] 💾 [job-123] Saving 15 profitable market logs to collection
[ProfitableMarketLogsAnalysisProcessor] ✅ [job-123] Successfully saved profitable market logs to collection
[ProfitableMarketLogsAnalysisProcessor] 🏆 Top profitable opportunities:
[ProfitableMarketLogsAnalysisProcessor] 1. BTCUSDT: 5.23% (reached in 2 hours) at 2024-01-01T10:00:00.000Z
```

## Performance Considerations

### Batch Processing

- Market logs are processed in batches of 400 to optimize memory usage
- Database operations use bulk insert for better performance
- Vector encoding is performed during save operations

### Data Retention

- Old profitable market logs can be cleaned up via the cleanup endpoint
- Default retention period is 30 days
- Vector data is indexed for efficient similarity searches

### Scalability

- Bull MQ provides job queuing and retry mechanisms
- SNS/SQS decouples triggering from processing
- Multiple processor instances can run concurrently

## Troubleshooting

### Common Issues

1. **SNS Topic Not Found**
   - Verify `AWS_SNS_MARKET_LOG_ANALYSIS_TOPIC` environment variable
   - Check AWS credentials and permissions

2. **SQS Queue Not Found**
   - Verify `AWS_SQS_MARKET_LOG_ANALYSIS_URL` environment variable
   - Check AWS credentials and permissions

3. **Redis Connection Issues**
   - Verify Redis connection settings
   - Check Redis server status

4. **Database Connection Issues**
   - Verify MongoDB connection string
   - Check database permissions

### Debug Mode

Enable debug logging by setting log level to DEBUG:

```typescript
// In your logging configuration
{
  level: 'debug',
  // ... other config
}
```

### Health Checks

Monitor system health via:

```bash
# Check Redis connection
redis-cli ping

# Check MongoDB connection
mongo --eval "db.runCommand('ping')"

# Check Bull MQ queues
redis-cli KEYS "bull:*"
```

## Future Enhancements

1. **Real-time Analysis**: Trigger analysis on new market log creation
2. **Advanced Filtering**: Add filters for specific market conditions
3. **ML Integration**: Use vector similarity for pattern matching
4. **Alerting**: Send notifications for high-profitability opportunities
5. **Dashboard**: Web interface for viewing and analyzing profitable logs
