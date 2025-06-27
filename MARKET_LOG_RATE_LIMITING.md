# Market Log Collection Rate Limiting

This document describes the Redis-based rate limiting system for market log collection to prevent excessive API calls to exchanges.

## Architecture Overview

The system follows a clean architecture pattern with proper separation of concerns:

```
Controller → Service Layer → Rate Limiter → Redis Cache
```

### Service Layer Components

- **`MarketLogStatusController`**: Handles HTTP requests and responses
- **`MarketLogStatusService`**: Contains business logic for status operations
- **`MarketLogRateLimiterService`**: Manages Redis-based rate limiting
- **`CacheService`**: Provides Redis operations

## Configuration

### Environment Variable

```env
MARKET_LOGS_COLLECTION_INTERVAL=3
```

- **Type**: Number (minutes)
- **Default**: 3 minutes
- **Range**: 1-60 minutes
- **Description**: Minimum interval between market log collections for each exchange

## How It Works

### 1. Rate Limiting Check

Before publishing a market log collection job, the system checks Redis for the last run time:

```typescript
const shouldSkip = await this.rateLimiter.shouldSkipCollection(exchangeDetails);
if (shouldSkip) {
  continue; // Skip this exchange
}
```

### 2. Redis Storage

- **Key Format**: `market-logs:last-run:{exchange-name}`
- **Value**: Unix timestamp (milliseconds)
- **TTL**: 24 hours (86400 seconds)

### 3. Collection Process

1. **Scheduler** (every minute): Checks all exchanges and publishes jobs for eligible ones
2. **Processor**: Updates the last run time after successful collection
3. **Rate Limiter**: Prevents collection if interval hasn't elapsed

## API Endpoints

### Get Collection Status

```http
GET /market-logs/status/v1
```

**Response:**

```json
{
  "collectionInterval": 3,
  "collectionIntervalMs": 180000,
  "exchanges": [
    {
      "name": "BINANCE",
      "timeUntilNextCollection": 120000,
      "timeUntilNextCollectionMinutes": 2,
      "canCollectNow": false
    },
    {
      "name": "BYBIT",
      "timeUntilNextCollection": 0,
      "timeUntilNextCollectionMinutes": 0,
      "canCollectNow": true
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Get Exchange Status

```http
GET /market-logs/status/v1/{exchangeName}
```

**Response:**

```json
{
  "name": "BINANCE",
  "timeUntilNextCollection": 120000,
  "timeUntilNextCollectionMinutes": 2,
  "canCollectNow": false,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Clear Rate Limit

```http
DELETE /market-logs/status/v1/{exchangeName}/rate-limit
```

**Response:**

```json
{
  "message": "Rate limit cleared for BINANCE",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Service Layer Architecture

### MarketLogStatusService

The main business logic service that handles:

- **Data Aggregation**: Combines rate limiter and exchange service data
- **Error Handling**: Proper exception handling with NotFoundException
- **Logging**: Comprehensive logging for debugging
- **DTO Mapping**: Converts domain objects to response DTOs

### MarketLogRateLimiterService

The core rate limiting service that manages:

- **Redis Operations**: Cache get/set operations with TTL
- **Time Calculations**: Interval and remaining time calculations
- **Cache Key Management**: Consistent key generation
- **Error Recovery**: Graceful handling of Redis failures

### Controller Responsibilities

The controller is now focused on:

- **HTTP Handling**: Request/response management
- **Status Codes**: Proper HTTP status codes
- **Service Delegation**: Delegating to service layer
- **No Business Logic**: Clean separation of concerns

## Logging

The system provides detailed logging:

```
✅ Market log collection rate limiter initialized with 3 minute interval
📊 Market log collection scheduled every 3 minutes
🔄 Checking 2 exchanges for market log collection
⏰ Skipping market log collection for BINANCE. Last run was 1 minutes ago. Next collection in 2 minutes.
📤 Published market log collection job for BYBIT
📝 Updated last run time for BYBIT to 2024-01-15T10:30:00.000Z
✅ Market log collection completed for exchange: BYBIT
```

## Benefits

1. **API Rate Limiting**: Prevents hitting exchange API rate limits
2. **Resource Optimization**: Reduces unnecessary API calls
3. **Configurable**: Easy to adjust intervals per environment
4. **Monitoring**: API endpoints for status monitoring
5. **Resilient**: Graceful handling of Redis failures
6. **Clean Architecture**: Proper separation of concerns
7. **Type Safety**: Strongly typed DTOs and responses
8. **Error Handling**: Proper exception handling and HTTP status codes

## Error Handling

- **Redis Failures**: Collection proceeds if rate limiting fails
- **Invalid Intervals**: Uses default 3 minutes if configuration is invalid
- **Missing Exchanges**: Returns 404 with proper error message
- **Service Layer**: Centralized error handling and logging

## Performance Considerations

- **Redis Operations**: Minimal overhead (get/set operations)
- **Memory Usage**: 24-hour TTL prevents unlimited growth
- **Concurrency**: Thread-safe Redis operations
- **Monitoring**: Built-in logging for debugging
- **Service Layer**: Efficient data aggregation and caching

## Troubleshooting

### Check Rate Limiting Status

```bash
curl http://localhost:3000/market-logs/status/v1
```

### Get Specific Exchange Status

```bash
curl http://localhost:3000/market-logs/status/v1/BINANCE
```

### Clear Rate Limit for Testing

```bash
curl -X DELETE http://localhost:3000/market-logs/status/v1/BINANCE/rate-limit
```

### Monitor Logs

```bash
# Look for rate limiting messages
grep "Skipping market log collection" logs/app.log
grep "Updated last run time" logs/app.log
grep "Fetching status for" logs/app.log
```

## Code Structure

```
src/trading/
├── controllers/
│   └── market-log-status.controller.ts    # HTTP handling
├── market-logs/
│   ├── services/
│   │   ├── market-log-status.service.ts   # Business logic
│   │   └── market-log-rate-limiter.service.ts # Rate limiting
│   └── dtos/
│       └── market-log-status.dto.ts       # Type definitions
└── trading.module.ts                      # Module configuration
```
