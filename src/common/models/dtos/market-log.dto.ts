import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { MarketCondition } from 'src/common/enums/market-condition.enum';
import { MarketPressure } from 'src/common/enums/market-pressure.enum';
import { TrendDirection } from 'src/common/enums/trend-direction.enum';
import { Candlestick } from './candlestick.dto';
import { Ema } from './indicators/ema.dto';
import { Sma } from './indicators/sma.dto';
import { BollingerBands } from './indicators/bollinger-bands.dto';
import { Stochastic } from './indicators/stochastic.dto';
import { Macd } from './indicators/macd.dto';
import { MarketType } from 'src/common/enums/market-type.enum';
import { MarketLog } from '../entities/market-log.entity';

export class TimeframeLogDto {
  @IsEnum(TrendDirection)
  trend: TrendDirection;

  @IsEnum(MarketCondition)
  sentiment: MarketCondition;

  @IsEnum(MarketPressure)
  pressure: MarketPressure;

  @IsNumber()
  rsi: number;

  @IsNumber()
  cci: number;

  @IsNumber()
  _9Ema: number;

  @IsNumber()
  _40Ema: number;

  @IsNumber()
  _14Sma: number;

  @IsNumber()
  _30Sma: number;

  @IsNumber()
  _50Sma: number;

  @IsNumber()
  bollingerAdx: number;

  @IsNumber()
  bollingerUpper: number;

  @IsNumber()
  bollingerMiddle: number;

  @IsNumber()
  bollingerLower: number;

  @IsNumber()
  macdValue: number;

  @IsNumber()
  macdSignal: number;

  @IsNumber()
  macdHistogram: number;

  @IsNumber()
  stochasticFast: number;

  @IsNumber()
  stochasticSlow: number;

  @IsNumber()
  volatilityPercent: number;

  @IsNumber()
  atr: number;

  _1LastCandleClose: number;
  _2LastCandleClose: number;
  isCurrentCandledClosed: boolean;

  lastCandleCloses: Candlestick[];

  constructor(
    trend: TrendDirection,
    sentiment: MarketCondition,
    pressure: MarketPressure,
    rsi: number,
    cci: number,
    _9Ema: number,
    _40Ema: number,
    _14Sma: number,
    _30Sma: number,
    _50Sma: number,
    bollingerAdx: number,
    bollingerUpper: number,
    bollingerMiddle: number,
    bollingerLower: number,
    macdValue: number,
    macdSignal: number,
    macdHistogram: number,
    stochasticFast: number,
    stochasticSlow: number,
    volatilityPercent: number,
    atr: number,
    _1LastCandleClose: number,
    _2LastCandleClose: number,
    isCurrentCandledClosed: boolean,
    lastCandleCloses: Candlestick[],
  ) {
    this.trend = trend;
    this.sentiment = sentiment;
    this.pressure = pressure;
    this.rsi = rsi;
    this.cci = cci;
    this._9Ema = _9Ema;
    this._40Ema = _40Ema;
    this._14Sma = _14Sma;
    this._30Sma = _30Sma;
    this._50Sma = _50Sma;
    this.bollingerAdx = bollingerAdx;
    this.bollingerUpper = bollingerUpper;
    this.bollingerMiddle = bollingerMiddle;
    this.bollingerLower = bollingerLower;
    this.macdValue = macdValue;
    this.macdSignal = macdSignal;
    this.macdHistogram = macdHistogram;
    this.stochasticFast = stochasticFast;
    this.stochasticSlow = stochasticSlow;
    this.volatilityPercent = volatilityPercent;
    this.atr = atr;
    this._1LastCandleClose = _1LastCandleClose;
    this._2LastCandleClose = _2LastCandleClose;
    this.isCurrentCandledClosed = isCurrentCandledClosed;
    this.lastCandleCloses = lastCandleCloses;
  }

  static fromIndicators(
    rsi: number,
    cci: number,
    ema: Ema,
    sma: Sma,
    atr: number,
    trend: TrendDirection,
    pressure: MarketPressure,
    sentiment: MarketCondition,
    bollinger: BollingerBands,
    stochastic: Stochastic,
    macd: Macd,
    last2Candles: Candlestick[],
    volatilityPercent: number,
    lastCandleCloses: Candlestick[],
  ): TimeframeLogDto {
    return new TimeframeLogDto(
      trend,
      sentiment,
      pressure,
      rsi,
      cci,
      ema._9Ema,
      ema._40Ema,
      sma._14Sma,
      sma._30Sma,
      sma._50Sma,
      bollinger.value,
      bollinger.upperLevel,
      bollinger.middleLevel,
      bollinger.lowerLevel,
      macd.value,
      macd.signal,
      macd.histogram,
      stochastic.fastLine,
      stochastic.slowLine,
      volatilityPercent,
      atr,
      last2Candles[1].close,
      last2Candles[0].close,
      false,
      lastCandleCloses.slice(-4).reverse(),
    );
  }
}

export class MarketLogDto {
  @IsString()
  market: MarketType;

  @IsString()
  from: string;

  @IsString()
  to: string;

  @IsNumber()
  currentPrice: number;

  @IsOptional()
  _5minTimeframe: TimeframeLogDto;

  @IsOptional()
  _15minTimeframe: TimeframeLogDto;

  @IsOptional()
  _1hTimeframe: TimeframeLogDto;

  @IsOptional()
  _4hTimeframe: TimeframeLogDto;

  @IsNumber()
  pricePrecision: number;

  @IsNumber()
  amountPrecision: number;

  @IsOptional()
  obi?: number;

  @IsOptional()
  change_3min?: number;

  @IsOptional()
  change_6min?: number;

  @IsOptional()
  change_9min?: number;

  @IsOptional()
  change_15min?: number;

  @IsOptional()
  change_30min?: number;

  @IsOptional()
  change_45min?: number;

  @IsOptional()
  change_1h?: number;

  @IsOptional()
  change_2h?: number;

  @IsOptional()
  change_3h?: number;

  @IsOptional()
  change_4h?: number;

  @IsOptional()
  change_8h?: number;

  @IsOptional()
  change_12h?: number;

  @IsOptional()
  createdAt?: Date;

  constructor(
    market: MarketType,
    from: string,
    to: string,
    currentPrice: number,
    pricePrecision: number,
    amountPrecision: number,
    obi?: number,
    change_3min?: number,
    change_6min?: number,
    change_9min?: number,
    change_15min?: number,
    change_30min?: number,
    change_45min?: number,
    change_1h?: number,
    change_2h?: number,
    change_3h?: number,
    change_4h?: number,
    change_8h?: number,
    change_12h?: number,
  ) {
    this.market = market;
    this.from = from;
    this.to = to;
    this.currentPrice = currentPrice;
    this.pricePrecision = pricePrecision;
    this.amountPrecision = amountPrecision;
    this.obi = obi;
    this.change_3min = change_3min;
    this.change_6min = change_6min;
    this.change_9min = change_9min;
    this.change_15min = change_15min;
    this.change_30min = change_30min;
    this.change_45min = change_45min;
    this.change_1h = change_1h;
    this.change_2h = change_2h;
    this.change_3h = change_3h;
    this.change_4h = change_4h;
    this.change_8h = change_8h;
    this.change_12h = change_12h;
  }

  toDbMarketLog(): Partial<MarketLog> {
    const marketLogEntity: Partial<MarketLog> = {
      market: this.market,
      from: this.from,
      to: this.to,
      currentPrice: this.currentPrice || 0,
      pricePrecision: this.pricePrecision,
      amountPrecision: this.amountPrecision,
      obi: this.obi || 0,
      change_3min: this.change_3min || 0,
      change_6min: this.change_6min || 0,
      change_9min: this.change_9min || 0,
      change_15min: this.change_15min || 0,
      change_30min: this.change_30min || 0,
      change_45min: this.change_45min || 0,
      change_1h: this.change_1h || 0,
      change_2h: this.change_2h || 0,
      change_3h: this.change_3h || 0,
      change_4h: this.change_4h || 0,
      change_8h: this.change_8h || 0,
      change_12h: this.change_12h || 0,
      _5minTrend: this._5minTimeframe?.trend || null,
      _5minSentiment: this._5minTimeframe?.sentiment || null,
      _5minPressure: this._5minTimeframe?.pressure || null,
      _5minRsi: this._5minTimeframe?.rsi || 0,
      _5minCci: this._5minTimeframe?.cci || 0,
      _5min_9Ema: this._5minTimeframe?._9Ema || 0,
      _5min_40Ema: this._5minTimeframe?._40Ema || 0,
      _5min_14Sma: this._5minTimeframe?._14Sma || 0,
      _5min_30Sma: this._5minTimeframe?._30Sma || 0,
      _5min_50Sma: this._5minTimeframe?._50Sma || 0,
      _5minAtr: this._5minTimeframe?.atr || 0,
      _5minBollingerAdx: this._5minTimeframe?.bollingerAdx || 0,
      _5minBollingerUpper: this._5minTimeframe?.bollingerUpper || 0,
      _5minBollingerMiddle: this._5minTimeframe?.bollingerMiddle || 0,
      _5minBollingerLower: this._5minTimeframe?.bollingerLower || 0,
      _5minMacdValue: this._5minTimeframe?.macdValue || 0,
      _5minMacdSignal: this._5minTimeframe?.macdSignal || 0,
      _5minMacdHistogram: this._5minTimeframe?.macdHistogram || 0,
      _5minStochasticFast: this._5minTimeframe?.stochasticFast || 0,
      _5minStochasticSlow: this._5minTimeframe?.stochasticSlow || 0,
      _5min1LastCandleClose: this._5minTimeframe?._1LastCandleClose,
      _5min2LastCandleClose: this._5minTimeframe?._2LastCandleClose,
      _5minVolatilityPercent: this._5minTimeframe?.volatilityPercent,
      _5minLastCandles: this._5minTimeframe?.lastCandleCloses,
      _15minTrend: this._15minTimeframe?.trend || null,
      _15minSentiment: this._15minTimeframe?.sentiment || null,
      _15minPressure: this._15minTimeframe?.pressure || null,
      _15minRsi: this._15minTimeframe?.rsi || 0,
      _15minCci: this._15minTimeframe?.cci || 0,
      _15min_9Ema: this._15minTimeframe?._9Ema || 0,
      _15min_40Ema: this._15minTimeframe?._40Ema || 0,
      _15min_14Sma: this._15minTimeframe?._14Sma || 0,
      _15min_30Sma: this._15minTimeframe?._30Sma || 0,
      _15min_50Sma: this._15minTimeframe?._50Sma || 0,
      _15minAtr: this._15minTimeframe?.atr || 0,
      _15minBollingerAdx: this._15minTimeframe?.bollingerAdx || 0,
      _15minBollingerUpper: this._15minTimeframe?.bollingerUpper || 0,
      _15minBollingerMiddle: this._15minTimeframe?.bollingerMiddle || 0,
      _15minBollingerLower: this._15minTimeframe?.bollingerLower || 0,
      _15minMacdValue: this._15minTimeframe?.macdValue || 0,
      _15minMacdSignal: this._15minTimeframe?.macdSignal || 0,
      _15minMacdHistogram: this._15minTimeframe?.macdHistogram || 0,
      _15minStochasticFast: this._15minTimeframe?.stochasticFast || 0,
      _15minStochasticSlow: this._15minTimeframe?.stochasticSlow || 0,
      _15min1LastCandleClose: this._15minTimeframe?._1LastCandleClose,
      _15min2LastCandleClose: this._15minTimeframe?._2LastCandleClose,
      _15minVolatilityPercent: this._15minTimeframe.volatilityPercent,
      _15minLastCandles: this._15minTimeframe.lastCandleCloses,

      _1hTrend: this._1hTimeframe?.trend || null,
      _1hSentiment: this._1hTimeframe?.sentiment || null,
      _1hPressure: this._1hTimeframe?.pressure || null,
      _1hRsi: this._1hTimeframe?.rsi || 0,
      _1hCci: this._1hTimeframe?.cci || 0,
      _1h_9Ema: this._1hTimeframe?._9Ema || 0,
      _1h_40Ema: this._1hTimeframe?._40Ema || 0,
      _1h_14Sma: this._1hTimeframe?._14Sma || 0,
      _1h_30Sma: this._1hTimeframe?._30Sma || 0,
      _1h_50Sma: this._1hTimeframe?._50Sma || 0,
      _1hAtr: this._1hTimeframe?.atr || 0,
      _1hBollingerAdx: this._1hTimeframe?.bollingerAdx || 0,
      _1hBollingerUpper: this._1hTimeframe?.bollingerUpper || 0,
      _1hBollingerMiddle: this._1hTimeframe?.bollingerMiddle || 0,
      _1hBollingerLower: this._1hTimeframe?.bollingerLower || 0,
      _1hMacdValue: this._1hTimeframe?.macdValue || 0,
      _1hMacdSignal: this._1hTimeframe?.macdSignal || 0,
      _1hMacdHistogram: this._1hTimeframe?.macdHistogram || 0,
      _1hStochasticFast: this._1hTimeframe?.stochasticFast || 0,
      _1hStochasticSlow: this._1hTimeframe?.stochasticSlow || 0,
      _1hLastCandleClose: this._1hTimeframe?._1LastCandleClose || 0,
      _1h2LastCandleClose: this._1hTimeframe?._2LastCandleClose || 0,
      _1hVolatilityPercent: this._1hTimeframe.volatilityPercent,
      _1hLastCandles: this._1hTimeframe.lastCandleCloses,

      _4hTrend: this._4hTimeframe?.trend || null,
      _4hSentiment: this._4hTimeframe?.sentiment || null,
      _4hPressure: this._4hTimeframe?.pressure || null,
      _4hRsi: this._4hTimeframe?.rsi || 0,
      _4hCci: this._4hTimeframe?.cci || 0,
      _4h_9Ema: this._4hTimeframe?._9Ema || 0,
      _4h_40Ema: this._4hTimeframe?._40Ema || 0,
      _4h_14Sma: this._4hTimeframe?._14Sma || 0,
      _4h_30Sma: this._4hTimeframe?._30Sma || 0,
      _4h_50Sma: this._4hTimeframe?._50Sma || 0,
      _4hAtr: this._4hTimeframe?.atr || 0,
      _4hBollingerAdx: this._4hTimeframe?.bollingerAdx || 0,
      _4hBollingerUpper: this._4hTimeframe?.bollingerUpper || 0,
      _4hBollingerMiddle: this._4hTimeframe?.bollingerMiddle || 0,
      _4hBollingerLower: this._4hTimeframe?.bollingerLower || 0,
      _4hMacdValue: this._4hTimeframe?.macdValue || 0,
      _4hMacdSignal: this._4hTimeframe?.macdSignal || 0,
      _4hMacdHistogram: this._4hTimeframe?.macdHistogram || 0,
      _4hStochasticFast: this._4hTimeframe?.stochasticFast || 0,
      _4hStochasticSlow: this._4hTimeframe?.stochasticSlow || 0,
      _4h1LastCandleClose: this._4hTimeframe?._1LastCandleClose || 0,
      _4h2LastCandleClose: this._4hTimeframe?._2LastCandleClose || 0,
      _4hVolatilityPercent: this._4hTimeframe.volatilityPercent,
      _4hLastCandles: this._4hTimeframe.lastCandleCloses,
    };

    marketLogEntity.isRanging = this._isRanging(marketLogEntity);

    return marketLogEntity;
  }

  _isRanging(log: Partial<MarketLog>): boolean {
    const isLowAdx = log._15minBollingerAdx < 0.25;
    const isNoTrend = log._15minTrend === 'NO_TREND' && log._1hTrend === 'NO_TREND';
    const isSidewaysSentiment = ['SIDEWAYS'].includes(log._1hSentiment) && ['SIDEWAYS'].includes(log._4hSentiment);
    const isFlatMacd = Math.abs(log._15minMacdHistogram || 0) < 0.002 && Math.abs(log._1hMacdHistogram || 0) < 0.002;
    const isLowStochastic = (log._15minStochasticFast || 0) < 20 && (log._1hStochasticFast || 0) < 20;

    return isLowAdx && isNoTrend && isSidewaysSentiment && isFlatMacd && isLowStochastic;
  }
}
