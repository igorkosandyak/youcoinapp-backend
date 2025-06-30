import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MarketCondition } from 'src/common/enums/market-condition.enum';
import { MarketPressure } from 'src/common/enums/market-pressure.enum';
import { OrderSide } from 'src/common/enums/order-side.enum';
import { TrendDirection } from 'src/common/enums/trend-direction.enum';
import { Candlestick } from '../dtos/candlestick.dto';

@Schema({ collection: 'profitable-market-logs' })
export class ProfitableMarketLog extends Document {
  @Prop({ type: String, enum: Object.values(OrderSide), required: true })
  opportunityFor: OrderSide;

  @Prop({ type: String, required: true })
  market: string;

  @Prop({ type: String, required: true })
  from: string;

  @Prop({ type: String, required: true })
  to: string;

  @Prop({ type: Number, required: true })
  currentPrice: number;

  @Prop({ type: Number, required: true, default: 0 })
  pricePrecision: number;

  @Prop({ type: Number, required: true, default: 0 })
  amountPrecision: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  obi: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  change_3min: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  change_6min: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  change_9min: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  change_15min: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  change_30min: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  change_45min: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  change_1h: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  change_2h: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  change_3h: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  change_4h: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  change_8h: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  change_12h: number;

  // 5min Timeframe properties
  @Prop({ type: String, enum: Object.values(TrendDirection), required: true })
  _5minTrend: string;

  @Prop({ type: String, enum: Object.values(MarketCondition), required: true })
  _5minSentiment: string;

  @Prop({ type: String, enum: Object.values(MarketPressure), required: true })
  _5minPressure: string;

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

  // 15min Timeframe properties
  @Prop({ type: String, enum: Object.values(TrendDirection), required: true })
  _15minTrend: string;

  @Prop({ type: String, enum: Object.values(MarketCondition), required: true })
  _15minSentiment: string;

  @Prop({ type: String, enum: Object.values(MarketPressure), required: true })
  _15minPressure: string;

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

  // 1h Timeframe properties
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

  // 1h Timeframe trend/sentiment/pressure fields
  @Prop({ type: String, enum: Object.values(TrendDirection), required: true })
  _1hTrend: string;

  @Prop({ type: String, enum: Object.values(MarketCondition), required: true })
  _1hSentiment: string;

  @Prop({ type: String, enum: Object.values(MarketPressure), required: true })
  _1hPressure: string;

  // 4h Timeframe properties
  @Prop({ type: Number, required: true, default: 0.0 })
  _4h1LastCandleClose: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  _4h2LastCandleClose: number;

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

  @Prop({ type: [Candlestick], required: false, default: [] })
  _4hLastCandles: Candlestick[];

  // 4h Timeframe trend/sentiment/pressure fields
  @Prop({ type: String, enum: Object.values(TrendDirection), required: false })
  _4hTrend: string;

  @Prop({ type: String, enum: Object.values(MarketCondition), required: false })
  _4hSentiment: string;

  @Prop({ type: String, enum: Object.values(MarketPressure), required: false })
  _4hPressure: string;

  // Profitability-specific fields
  @Prop({ type: Boolean, required: true, default: true })
  wasProfitable: boolean;

  @Prop({ type: Number, required: true })
  maxPriceChangePercent: number;

  @Prop({ type: Date, required: true })
  profitabilityCheckedAt: Date;

  @Prop({ type: String, required: true })
  timeToReach: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Boolean, required: false, default: false })
  isRanging: boolean;

  @Prop({ type: [Number], required: false, index: true })
  vectorData: number[];

  // Analysis metadata
  @Prop({ type: Date, required: true })
  analysisDate: Date;

  @Prop({ type: String, required: true })
  analysisType: string; // 'daily' or 'on-demand'

  @Prop({ type: String, required: false })
  originalMarketLogId: string; // Reference to the original market log
}

// eslint-disable-next-line prettier/prettier
export const ProfitableMarketLogSchema = SchemaFactory.createForClass(ProfitableMarketLog);
