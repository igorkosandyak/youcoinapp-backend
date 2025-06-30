import { Injectable } from '@nestjs/common';
import { MarketCondition } from 'src/common/enums/market-condition.enum';
import { MarketPressure } from 'src/common/enums/market-pressure.enum';
import { TrendDirection } from 'src/common/enums/trend-direction.enum';
import { BollingerBands, Candlestick, Ema, Macd, Sma, Stochastic } from 'src/common/models';
import * as technicalindicators from 'technicalindicators';
import { ATRInput } from 'technicalindicators/declarations/directionalmovement/ATR';

@Injectable()
export class IndicatorsService {
  constructor() {}

  getRSI(candlesticks: Candlestick[]): number {
    const closePrices = candlesticks.slice(-30).map(candle => candle.close);
    const inputRSI = { values: closePrices, period: 14 };
    const rsiValues = technicalindicators.RSI.calculate(inputRSI);
    const rsi = rsiValues[rsiValues.length - 1];
    return rsi;
  }

  getEma(candlesticks: Candlestick[]): Ema {
    const _9Ema = this._get9EMA(candlesticks);
    const _40Ema = this._get40EMA(candlesticks);
    return new Ema(_9Ema, _40Ema);
  }

  getSma(candlesticks: Candlestick[]): Sma {
    const _14Sma = this._calculateSMA(candlesticks, 14);
    const _30Sma = this._calculateSMA(candlesticks, 30);
    const _50Sma = this._calculateSMA(candlesticks, 50);
    return new Sma(_14Sma, _30Sma, _50Sma);
  }

  getAtr(candlesticks: Candlestick[]): number {
    const high = candlesticks.map(candle => candle.high);
    const low = candlesticks.map(candle => candle.low);
    const close = candlesticks.map(candle => candle.close);

    const atrInput: ATRInput = {
      high: high,
      low: low,
      close: close,
      period: 14,
    };
    const atrValues = technicalindicators.ATR.calculate(atrInput);
    const lastClose = close[close.length - 1];
    const atr = atrValues.length > 0 ? atrValues[atrValues.length - 1] : 0;
    const percentageATR = lastClose > 0 ? (atr / lastClose) * 100 : 0;

    return parseFloat(percentageATR.toFixed(2));
  }

  getAdx(candlesticks: Candlestick[]): any {
    const highs = [];
    const lows = [];
    const closes = [];
    candlesticks.slice(-28).forEach((candlestick: Candlestick) => {
      highs.push(candlestick.high);
      lows.push(candlestick.low);
      closes.push(candlestick.close);
    });
    const adxInput = { period: 14, high: highs, low: lows, close: closes };
    const adxResult = technicalindicators.ADX.calculate(adxInput);
    const adxObject = adxResult[adxResult.length - 1];

    return adxObject;
  }

  getTrend(candlesticks: Candlestick[]): TrendDirection {
    const adxResult = this.getAdx(candlesticks);
    const { adx, pdi, mdi } = adxResult;

    const adxThreshold = 25;
    const diDifferenceThreshold = 5;

    if (adx > adxThreshold) {
      if (pdi > mdi && pdi - mdi > diDifferenceThreshold) {
        return TrendDirection.UPTREND;
      } else if (mdi > pdi && mdi - pdi > diDifferenceThreshold) {
        return TrendDirection.DOWNTREND;
      } else {
        return TrendDirection.NO_TREND;
      }
    } else {
      return TrendDirection.NO_TREND;
    }
  }

  getMarketPressure(candlesticks: Candlestick[]): MarketPressure {
    const avgVolume = this._getAvgVolume(candlesticks, 20);
    const currentVolume = this._getCurrentVolume(candlesticks);

    if (currentVolume > 1.5 * avgVolume) {
      return MarketPressure.STRONG;
    } else if (currentVolume < 0.5 * avgVolume) {
      return MarketPressure.LOW;
    }
    return MarketPressure.REGULAR;
  }

  getMarketCondition(candlesticks: Candlestick[]): MarketCondition {
    const bollingerBands = this.getBollingerBands(candlesticks);
    return bollingerBands.marketCondition;
  }

  getBollingerBands(candlesticks: Candlestick[]): BollingerBands {
    const period = 14;
    const input = {
      period: period,
      values: candlesticks.slice(-30).map((candlestick: Candlestick) => candlestick.close),
      stdDev: 2,
    };

    const bands = technicalindicators.BollingerBands.calculate(input);
    const avgPB = bands.reduce((sum, band) => sum + band.pb, 0) / bands.length;

    const avgMiddle = bands.reduce((sum, band) => sum + band.middle, 0) / bands.length;
    const avgUpper = bands.reduce((sum, band) => sum + band.upper, 0) / bands.length;
    const avgLower = bands.reduce((sum, band) => sum + band.lower, 0) / bands.length;

    return new BollingerBands(avgPB, avgUpper, avgLower, avgMiddle);
  }

  getStochasticOscillator(candlesticks: Candlestick[]): Stochastic {
    const highPrices = candlesticks.map(candle => candle.high);
    const lowPrices = candlesticks.map(candle => candle.low);
    const closePrices = candlesticks.map(candle => candle.close);

    const stochasticInput = {
      high: highPrices,
      low: lowPrices,
      close: closePrices,
      period: 14,
      signalPeriod: 3,
    };

    const stochasticResult = technicalindicators.Stochastic.calculate(stochasticInput);
    const stochastic = stochasticResult[stochasticResult.length - 1];
    return new Stochastic(stochastic.k, stochastic.d);
  }

  getMACD(candlesticks: Candlestick[]): Macd {
    const closePrices = candlesticks.map(candle => candle.close);
    const macdInput = {
      values: closePrices,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
    };
    const macdResult = technicalindicators.MACD.calculate(macdInput);
    const macd = macdResult[macdResult.length - 1];
    return new Macd(macd.MACD, macd.signal, macd.histogram);
  }

  getCCI(candlesticks: Candlestick[]): number {
    const recentCandles = candlesticks.slice(-30); // ensure we have enough data
    const high = recentCandles.map(c => c.high);
    const low = recentCandles.map(c => c.low);
    const close = recentCandles.map(c => c.close);

    const inputCCI = {
      high,
      low,
      close,
      period: 20,
    };

    const cciValues = technicalindicators.CCI.calculate(inputCCI);
    const cci = cciValues[cciValues.length - 1];

    return cci;
  }

  getOBI(orderbook: any, depth = 10): number {
    const bids = orderbook.bids.slice(0, depth);
    const asks = orderbook.asks.slice(0, depth);

    const bidVolume = bids.reduce((sum, [, volume]) => sum + parseFloat(volume), 0);
    const askVolume = asks.reduce((sum, [, volume]) => sum + parseFloat(volume), 0);

    const total = bidVolume + askVolume;
    if (total === 0) return 0;

    const imbalance = (bidVolume - askVolume) / total;
    return imbalance;
  }

  private _get9EMA(candlesticks: Candlestick[]): number {
    const closePrices = candlesticks.slice(-9).map(candle => candle.close);
    const emaValues = technicalindicators.EMA.calculate({
      period: 9,
      values: closePrices,
    });
    const _9Ema = emaValues[emaValues.length - 1];
    return _9Ema;
  }

  private _get40EMA(candlesticks: Candlestick[]): number {
    const closePrices = candlesticks.slice(-40).map(candle => candle.close);
    const emaValues = technicalindicators.EMA.calculate({
      period: 40,
      values: closePrices,
    });
    const _40Ema = emaValues[emaValues.length - 1];
    return _40Ema;
  }

  _calculateSMA(candlesticks: Candlestick[], period: number): number {
    const closePrices = candlesticks.map(candle => candle.close);
    const inputSMA = { values: closePrices, period };
    const smaValues = technicalindicators.SMA.calculate(inputSMA);
    return smaValues[smaValues.length - 1];
  }

  private _getAvgVolume(candlesticks: Candlestick[], period: number = 20): number {
    const volumes = candlesticks
      .slice(-period)
      .map((candlestick: Candlestick) => parseFloat(candlestick.volume.toString()));
    const totalVolume = volumes.reduce((sum, volume) => sum + volume, 0);

    return totalVolume / volumes.length;
  }

  private _getCurrentVolume(candlesticks: Candlestick[]): number {
    const currentVolume = parseFloat(candlesticks.slice(-2)[0].volume.toString());
    return currentVolume;
  }
}
