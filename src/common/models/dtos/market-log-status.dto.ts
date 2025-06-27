export class ExchangeStatusDto {
  name: string;
  timeUntilNextCollection: number;
  timeUntilNextCollectionMinutes: number;
  canCollectNow: boolean;
}

export class CollectionStatsDto {
  collectionInterval: number;
  collectionIntervalMs: number;
  exchanges: ExchangeStatusDto[];
  timestamp: string;
}

export class ExchangeStatusResponseDto {
  name: string;
  timeUntilNextCollection: number;
  timeUntilNextCollectionMinutes: number;
  canCollectNow: boolean;
  timestamp: string;
}

export class ClearRateLimitResponseDto {
  message: string;
  timestamp: string;
}

export class ErrorResponseDto {
  error: string;
  statusCode: number;
  timestamp: string;
}
