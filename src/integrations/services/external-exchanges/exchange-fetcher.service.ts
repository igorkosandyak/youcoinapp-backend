import { Candlestick } from 'src/common/models';
import { ExchangeDetails } from 'src/common/models/entities/exchange-details.entity';
import { CalcUtils } from 'src/common/utils/calc-utils.service';
import { TimeUtils } from 'src/common/utils/time-utils.service';

export interface ExchangeFetcherService {
  init(exchange: ExchangeDetails, calcs: CalcUtils, timeUtils: TimeUtils): ExchangeFetcherService;

  getSpotCandles(from: string, to: string, interval: string): Promise<Candlestick[]>;

  getSpotLatestPrices(): Promise<Record<string, number>>;

  getSpotOrderbook(from: string, to: string): Promise<any>;
}
