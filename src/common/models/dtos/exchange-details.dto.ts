import { IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { ExchangeName } from 'src/common/enums/exchange-name.enum';
import { MarketType } from 'src/common/enums/market-type.enum';
import { TradingStatus } from 'src/common/enums/trading-status.enum';
import { RelatesTo } from 'src/common/enums/relates-to.enum';

class EntryStrategy {
  @IsString()
  name: string;

  @IsString()
  mode: 'DEMO' | 'LIVE';
}

export class ExchangeSettings {
  @IsOptional()
  @IsString({ each: true })
  usdtPairs: string[];

  @IsOptional()
  @IsString({ each: true })
  btcPairs: string[];

  @IsOptional()
  @IsString({ each: true })
  ethPairs: string[];

  @IsNumber()
  orderIntervalMinutes: number;

  @IsString()
  baseAsset: string;

  @IsNumber()
  batchesQty: number;

  @IsNumber()
  batchOrdersQty: number;

  @IsOptional()
  @IsString()
  exchangeFee: string;

  @IsOptional()
  @IsString()
  earningPercent: string;

  @IsNumber()
  demoOrderBaseAmount: number;

  @IsNumber()
  liveOrderBaseAmount: number;
}

export class ExchangeDetailsDto {
  @IsString()
  @IsEnum(RelatesTo)
  relatesTo: RelatesTo;

  @IsString()
  @IsEnum(ExchangeName)
  name: ExchangeName;

  @IsString()
  @IsEnum(MarketType)
  market: MarketType;

  @IsOptional()
  @IsString()
  @IsEnum(TradingStatus)
  status: TradingStatus;

  @IsString()
  apiKey: string;

  @IsString()
  secretKey: string;

  @ValidateNested()
  @Type(() => ExchangeSettings)
  settings: ExchangeSettings;

  @IsString()
  tradingStrategy: string;

  @IsString()
  telegramId: string;

  @ValidateNested({ each: true })
  @Type(() => EntryStrategy)
  entryStrategies: EntryStrategy[];
}
