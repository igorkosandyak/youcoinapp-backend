# Redis Configuration Guide

This document explains the Redis configuration for the YouCoin trading backend and how to resolve common issues.

## Architecture Overview

The application uses Redis for two distinct purposes:

1. **Cache Service** - For application caching (read-only replica OK)
2. **Bull MQ Job Queues** - For background job processing (requires read-write access)

## Configuration Options

### Environment Variables

#### Cache Redis (Read-Only Replica OK)

```env
# Cache Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_KEY_PREFIX=youcoin:
```

#### Bull MQ Redis (Requires Read-Write Access)

```env
# Bull MQ Redis Configuration (separate from cache)
BULL_REDIS_HOST=localhost
BULL_REDIS_PORT=6379
BULL_REDIS_PASSWORD=
BULL_REDIS_DB=1
```

## Common Issues and Solutions

### Issue: "READONLY You can't write against a read only replica"

**Error Message:**

```
ReplyError: READONLY You can't write against a read only replica.
```

**Cause:** Bull MQ is trying to write to a Redis instance that's configured as a read-only replica.

**Solutions:**

#### Option 1: Use Separate Redis Instances (Recommended)

Configure separate Redis instances for caching and job queues:

```env
# Cache Redis (read-only replica)
REDIS_HOST=redis-replica.example.com
REDIS_PORT=6379
REDIS_PASSWORD=your-password
REDIS_DB=0

# Bull MQ Redis (primary/master instance)
BULL_REDIS_HOST=redis-master.example.com
BULL_REDIS_PORT=6379
BULL_REDIS_PASSWORD=your-password
BULL_REDIS_DB=1
```

#### Option 2: Use Different Redis Databases

If you only have one Redis instance, use different databases:

```env
# Cache Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Bull MQ Redis (same instance, different DB)
BULL_REDIS_HOST=localhost
BULL_REDIS_PORT=6379
BULL_REDIS_PASSWORD=
BULL_REDIS_DB=1
```

#### Option 3: Configure Redis Cluster

For production environments, use Redis Cluster with proper read-write separation:

```env
# Cache Redis (read replicas)
REDIS_HOST=redis-replica-1.example.com,redis-replica-2.example.com
REDIS_PORT=6379

# Bull MQ Redis (master nodes)
BULL_REDIS_HOST=redis-master-1.example.com,redis-master-2.example.com
BULL_REDIS_PORT=6379
```

## Production Recommendations

### 1. Separate Redis Instances

- Use dedicated Redis instances for caching and job queues
- Cache Redis can be read-only replicas for better performance
- Bull MQ Redis must be read-write capable

### 2. Redis Cluster Configuration

```env
# Development
REDIS_HOST=localhost
BULL_REDIS_HOST=localhost
BULL_REDIS_DB=1

# Production
REDIS_HOST=redis-cache-cluster.example.com
BULL_REDIS_HOST=redis-jobs-cluster.example.com
```

### 3. Connection Pooling

The application automatically configures connection pooling with:

- `retryDelayOnFailover: 100`
- `maxRetriesPerRequest: 3`
- `lazyConnect: true`
- `keepAlive: 30000`

### 4. Monitoring

Monitor Redis connections and performance:

- Cache hit/miss ratios
- Job queue processing times
- Redis memory usage
- Connection pool health

## Troubleshooting

### Check Redis Connection

```bash
# Test cache Redis
redis-cli -h $REDIS_HOST -p $REDIS_PORT ping

# Test Bull MQ Redis
redis-cli -h $BULL_REDIS_HOST -p $BULL_REDIS_PORT ping
```

### Check Redis Role

```bash
# Check if Redis is read-only
redis-cli -h $REDIS_HOST -p $REDIS_PORT info replication
```

### Verify Bull MQ Configuration

```bash
# Check Bull MQ queues in Redis
redis-cli -h $BULL_REDIS_HOST -p $BULL_REDIS_PORT -n $BULL_REDIS_DB keys "bull:*"
```

## Migration Guide

### From Single Redis to Separate Instances

1. **Update Environment Variables:**

   ```env
   # Add Bull MQ specific variables
   BULL_REDIS_HOST=your-master-redis-host
   BULL_REDIS_PORT=6379
   BULL_REDIS_DB=1
   ```

2. **Deploy Changes:**

   ```bash
   git commit -m "Add separate Bull MQ Redis configuration"
   git push
   ```

3. **Verify Configuration:**
   - Check application logs for Redis connection messages
   - Monitor job queue processing
   - Verify cache functionality

### Data Migration (if needed)

If you need to migrate existing job data:

```bash
# Export jobs from old Redis
redis-cli -h old-redis-host -p 6379 -n 0 keys "bull:*" | xargs redis-cli -h old-redis-host -p 6379 -n 0 mget

# Import to new Redis (if using different instance)
# Note: Bull MQ will recreate jobs as needed
```
