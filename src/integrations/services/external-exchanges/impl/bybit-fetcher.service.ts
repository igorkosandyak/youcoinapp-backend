/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import { ExchangeFetcherService } from '../exchange-fetcher.service';
import { CalcUtils } from 'src/common/utils/calc-utils.service';
import { TimeUtils } from 'src/common/utils/time-utils.service';
import { ExchangeDetails } from 'src/common/models/entities/exchange-details.entity';
import { bybit } from 'ccxt';
import { Candlestick } from 'src/common/models';

@Injectable()
export class BybitFetcherService implements ExchangeFetcherService {
  private readonly logger = new Logger(BybitFetcherService.name);
  private BYBIT = null;
  private calcs = null;
  private timeUtils = null;
  constructor() {}

  init(exchange: ExchangeDetails, calcs: CalcUtils, timeUtils: TimeUtils): ExchangeFetcherService {
    this.BYBIT = new bybit({
      apiKey: exchange.apiKey,
      secret: exchange.secretKey,
    });
    this.calcs = calcs;
    this.timeUtils = timeUtils;

    return this;
  }

  async getSpotCandles(from: string, to: string, interval: string): Promise<Candlestick[]> {
    const symbol = from.includes('1000') ? `${from}${to}` : `${from}/${to}`;
    const candles = await this.BYBIT.fetchOHLCV(symbol, interval);

    const intervalMinutes = interval.endsWith('m')
      ? parseInt(interval.slice(0, -1))
      : interval.endsWith('h')
        ? parseInt(interval.slice(0, -1)) * 60
        : 1;
    const candleSticks: Candlestick[] = candles.map(
      ([openTime, , high, low, close, volume]) => new Candlestick(openTime, intervalMinutes, high, low, close, volume),
    );
    //latest is the last candle
    return candleSticks;
  }

  async getSpotLatestPrices(): Promise<Record<string, number>> {
    try {
      const response = await this.BYBIT.fetchTickers();
      const priceRecord: Record<string, number> = {};

      for (const key in response) {
        const ticker = response[key];
        const { info, last } = ticker;
        if (last === undefined) {
          console.warn(`No last price for ${key}, skipping...`);
          continue;
        }

        priceRecord[info.symbol] = last;
      }

      return priceRecord;
    } catch (error) {
      console.error('Error fetching spot prices:', error);
      throw error;
    }
  }

  async getSpotOrderbook(from: string, to: string): Promise<any> {
    const response = await this.BYBIT.fetchOrderBook(from + to);
    return response;
  }
}
