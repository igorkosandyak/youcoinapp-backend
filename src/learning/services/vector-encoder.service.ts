import { Injectable, Logger } from '@nestjs/common';
import { MarketLog } from 'src/common/models';

@Injectable()
export class VectorEncoderService {
  private readonly logger = new Logger(VectorEncoderService.name);

  constructor() {}

  encode(log: Partial<MarketLog>): number[] {
    const safe = (value?: number): number =>
      typeof value === 'number' ? value : 0;

    const encodeTrend = (trend?: string): number[] => [
      trend === 'DOWNTREND' ? 1 : 0,
      trend === 'NO_TREND' ? 1 : 0,
      trend === 'UPTREND' ? 1 : 0,
    ];

    const encodeSentiment = (sentiment?: string): number[] => [
      sentiment === 'SUPER_BEARISH' ? 1 : 0,
      sentiment === 'BEARISH' ? 1 : 0,
      sentiment === 'SIDEWAYS' ? 1 : 0,
      sentiment === 'BULLISH' ? 1 : 0,
      sentiment === 'SUPER_BULLISH' ? 1 : 0,
    ];

    const encodePressure = (pressure?: string): number[] => [
      pressure === 'LOW' ? 1 : 0,
      pressure === 'REGULAR' ? 1 : 0,
      pressure === 'STRONG' ? 1 : 0,
    ];

    const currentPrice = safe(log.currentPrice);

    const priceContext = (prefix: string) => {
      const lower = safe(log[`${prefix}BollingerLower` as keyof MarketLog]);
      const middle = safe(log[`${prefix}BollingerMiddle` as keyof MarketLog]);
      const upper = safe(log[`${prefix}BollingerUpper` as keyof MarketLog]);
      const bbWidth = upper - lower;
      return [
        lower > 0 ? currentPrice / lower : 0,
        middle > 0 ? currentPrice / middle : 0,
        upper > 0 ? currentPrice / upper : 0,
        bbWidth,
        safe(log[`${prefix}BollingerAdx` as keyof MarketLog]),
      ];
    };

    const momentumContext = (prefix: string): number[] => {
      const delta9Ema =
        currentPrice - safe(log[`${prefix}_9Ema` as keyof MarketLog]);
      const delta40Ema =
        currentPrice - safe(log[`${prefix}_40Ema` as keyof MarketLog]);
      const delta14Sma =
        currentPrice - safe(log[`${prefix}_14Sma` as keyof MarketLog]);
      const delta30Sma =
        currentPrice - safe(log[`${prefix}_30Sma` as keyof MarketLog]);
      const delta50Sma =
        currentPrice - safe(log[`${prefix}_50Sma` as keyof MarketLog]);
      return [delta9Ema, delta40Ema, delta14Sma, delta30Sma, delta50Sma];
    };

    const oscillatorContext = (prefix: string): number[] => [
      safe(log[`${prefix}Rsi` as keyof MarketLog]),
      safe(log[`${prefix}Cci` as keyof MarketLog]),
      safe(log[`${prefix}MacdHistogram` as keyof MarketLog]),
      safe(log[`${prefix}MacdValue` as keyof MarketLog]),
      safe(log[`${prefix}MacdSignal` as keyof MarketLog]),
      safe(log[`${prefix}StochasticFast` as keyof MarketLog]),
      safe(log[`${prefix}StochasticSlow` as keyof MarketLog]),
    ];

    const volatilityContext = (prefix: string): number[] => [
      safe(log[`${prefix}Atr` as keyof MarketLog]),
      safe(log[`${prefix}VolatilityPercent` as keyof MarketLog]),
    ];

    // Price change context - includes all time-based price changes
    const priceChangeContext = (): number[] => {
      const priceChanges = [
        safe(log.change_3min),
        safe(log.change_6min),
        safe(log.change_9min),
        safe(log.change_15min),
        safe(log.change_30min),
        safe(log.change_45min),
        safe(log.change_1h),
        safe(log.change_2h),
        safe(log.change_3h),
        safe(log.change_4h),
        safe(log.change_8h),
        safe(log.change_12h),
      ];

      return priceChanges;
    };

    // Order book imbalance context
    const orderBookContext = (): number[] => [safe(log.obi)];

    return [
      // Order book imbalance
      ...orderBookContext(),

      // Price changes across different timeframes
      ...priceChangeContext(),

      // Oscillators for all timeframes
      ...oscillatorContext('_5min'),
      ...oscillatorContext('_15min'),
      ...oscillatorContext('_1h'),
      ...oscillatorContext('_4h'),

      // Trends for all timeframes
      ...encodeTrend(log._5minTrend),
      ...encodeTrend(log._15minTrend),
      ...encodeTrend(log._1hTrend),
      ...encodeTrend(log._4hTrend),

      // Sentiments for all timeframes
      ...encodeSentiment(log._5minSentiment),
      ...encodeSentiment(log._15minSentiment),
      ...encodeSentiment(log._1hSentiment),
      ...encodeSentiment(log._4hSentiment),

      // Market pressure for all timeframes
      ...encodePressure(log._5minPressure),
      ...encodePressure(log._15minPressure),
      ...encodePressure(log._1hPressure),
      ...encodePressure(log._4hPressure),

      // Price context (Bollinger Bands) for all timeframes
      ...priceContext('_5min'),
      ...priceContext('_15min'),
      ...priceContext('_1h'),
      ...priceContext('_4h'),

      // Momentum context (EMA/SMA deltas) for all timeframes
      ...momentumContext('_5min'),
      ...momentumContext('_15min'),
      ...momentumContext('_1h'),
      ...momentumContext('_4h'),

      // Volatility context for all timeframes
      ...volatilityContext('_5min'),
      ...volatilityContext('_15min'),
      ...volatilityContext('_1h'),
      ...volatilityContext('_4h'),
    ];
  }
}
