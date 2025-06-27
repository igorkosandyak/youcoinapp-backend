import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MarketCondition } from 'src/common/enums/market-condition.enum';
import { MarketPressure } from 'src/common/enums/market-pressure.enum';
import { MarketType } from 'src/common/enums/market-type.enum';
import { TrendDirection } from 'src/common/enums/trend-direction.enum';
import { Candlestick } from '../dtos/candlestick.dto';

@Schema({ collection: 'market-logs' })
export class MarketLog extends Document {
  @Prop({ type: String, enum: Object.values(MarketType), required: true })
  market: MarketType;

  @Prop({ type: String, required: true })
  from: string;

  @Prop({ type: String, required: true })
  to: string;

  @Prop({ type: Number, required: true, default: 0.0 })
  currentPrice: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  obi: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  change_3min: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  change_6min: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  change_9min: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  change_15min: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  change_30min: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  change_45min: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  change_1h: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  change_2h: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  change_3h: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  change_4h: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  change_8h: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  change_12h: number;

  @Prop({ type: String, enum: TrendDirection, required: true })
  _5minTrend: TrendDirection;

  @Prop({ type: String, enum: MarketCondition, required: true })
  _5minSentiment: MarketCondition;

  @Prop({ type: String, enum: MarketPressure, required: true })
  _5minPressure: MarketPressure;

  @Prop({ type: Number, required: true, default: 0.0 })
  _5minRsi: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _5minCci: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _5min1LastCandleClose: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _5min2LastCandleClose: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _5min_9Ema: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _5min_40Ema: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _5min_14Sma: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _5min_30Sma: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _5min_50Sma: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _5minBollingerAdx: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _5minBollingerUpper: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _5minBollingerMiddle: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _5minBollingerLower: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _5minMacdValue: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _5minMacdSignal: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _5minMacdHistogram: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _5minStochasticFast: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _5minStochasticSlow: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _5minAtr: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  _5minVolatilityPercent: number;

  @Prop({ type: [Candlestick], required: false, default: [] })
  _5minLastCandles: Candlestick[];

  // 5min Timeframe properties

  @Prop({ type: String, enum: TrendDirection, required: true })
  _15minTrend: TrendDirection;

  @Prop({ type: String, enum: TrendDirection, required: true })
  _1hTrend: TrendDirection;

  @Prop({ type: String, enum: TrendDirection, required: false })
  _4hTrend: TrendDirection;

  @Prop({ type: String, enum: MarketCondition, required: true })
  _15minSentiment: MarketCondition;

  @Prop({ type: String, enum: MarketCondition, required: true })
  _1hSentiment: MarketCondition;

  @Prop({ type: String, enum: MarketCondition, required: false })
  _4hSentiment: MarketCondition;

  @Prop({ type: String, enum: MarketPressure, required: true })
  _15minPressure: MarketPressure;

  @Prop({ type: String, enum: MarketPressure, required: true })
  _1hPressure: MarketPressure;

  @Prop({ type: String, enum: MarketPressure, required: false })
  _4hPressure: MarketPressure;

  @Prop({ type: Number, required: true, default: 0.0 })
  _15minRsi: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _15minCci: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _15min1LastCandleClose: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _15min2LastCandleClose: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _15min_9Ema: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _15min_40Ema: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _15min_14Sma: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _15min_30Sma: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _15min_50Sma: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _15minBollingerAdx: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _15minBollingerUpper: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _15minBollingerMiddle: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _15minBollingerLower: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _15minMacdValue: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _15minMacdSignal: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _15minMacdHistogram: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _15minStochasticFast: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _15minStochasticSlow: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _15minAtr: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  _15minVolatilityPercent: number;

  @Prop({ type: [Candlestick], required: false, default: [] })
  _15minLastCandles: Candlestick[];

  // 15min Timeframe properties

  @Prop({ type: Number, required: true, default: 0.0 })
  _1hLastCandleClose: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _1h2LastCandleClose: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _1hRsi: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _1hCci: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _1h_9Ema: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _1h_40Ema: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _1h_14Sma: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _1h_30Sma: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _1h_50Sma: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _1hBollingerAdx: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _1hBollingerUpper: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _1hBollingerMiddle: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _1hBollingerLower: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _1hMacdValue: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _1hMacdSignal: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _1hMacdHistogram: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _1hStochasticFast: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _1hStochasticSlow: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _1hAtr: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  _1hVolatilityPercent: number;

  @Prop({ type: [Candlestick], required: false, default: [] })
  _1hLastCandles: Candlestick[];

  // 1h Timeframe properties

  @Prop({ type: Number, required: true, default: 0.0 })
  _4h1LastCandleClose: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _4h2LastCandleClose: number;

  @Prop({ type: [Candlestick], required: false, default: [] })
  _4hLastCandles: Candlestick[];

  @Prop({ type: Number, required: false, default: 0.0 })
  _4hRsi: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  _4hCci: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  _4h_9Ema: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  _4h_40Ema: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  _4h_14Sma: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  _4h_30Sma: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  _4h_50Sma: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  _4hBollingerAdx: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  _4hBollingerUpper: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  _4hBollingerMiddle: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  _4hBollingerLower: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  _4hMacdValue: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  _4hMacdSignal: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  _4hMacdHistogram: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  _4hStochasticFast: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  _4hStochasticSlow: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  _4hAtr: number;

  @Prop({ type: Number, required: false, default: 0.0 })
  _4hVolatilityPercent: number;

  @Prop({ type: Boolean, required: false, default: null })
  wasProfitable: boolean;

  @Prop({ type: Number, required: false, default: null })
  maxPriceChangePercent: number;

  @Prop({ type: Date, required: false, default: null })
  profitabilityCheckedAt: Date;

  @Prop({ type: String, required: false, default: null })
  timeToReach: string;

  @Prop({ type: Number, required: true, default: 0 })
  pricePrecision: number;

  @Prop({ type: Number, required: true, default: 0 })
  amountPrecision: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Boolean, required: false, default: false })
  isRanging: boolean;

  @Prop({ type: [Number], required: false, index: true })
  vectorData: number[];

  is15MinSentimentBullish(): boolean {
    return (
      this._15minSentiment === MarketCondition.BULLISH ||
      this._15minSentiment === MarketCondition.SUPER_BULLISH
    );
  }

  is15MinSentimentBearish(): boolean {
    return (
      this._15minSentiment === MarketCondition.BEARISH ||
      this._15minSentiment === MarketCondition.SUPER_BEARISH
    );
  }

  is15MinMacdBullish(): boolean {
    return (
      this._15minMacdValue > this._15minMacdSignal &&
      this._15minMacdHistogram > 0
    );
  }

  is15MinMacdBearish(): boolean {
    return this._15minMacdValue < this._15minMacdSignal;
  }

  is15MinCciBullish(): boolean {
    return this._15minCci > 100;
  }

  is15MinCciBearish(): boolean {
    return this._15minCci < -100;
  }

  is1hCciBullish(): boolean {
    return this._1hCci > 100;
  }

  is1hCciBearish(): boolean {
    return this._1hCci < -100;
  }

  is4hCciBullish(): boolean {
    return this._4hCci > 100;
  }

  is4hCciBearish(): boolean {
    return this._4hCci < -100;
  }
}

export type MarketLogDocument = MarketLog & Document;

export const MarketLogSchema = SchemaFactory.createForClass(MarketLog);
