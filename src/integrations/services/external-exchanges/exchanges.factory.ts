import { Injectable } from '@nestjs/common';
import { ExchangeFetcherService } from './exchange-fetcher.service';
import { BybitFetcherService } from './impl/bybit-fetcher.service';
import { BinanceFetcherService } from './impl/binance-fetcher.service';
import { ExchangeName } from 'src/common/enums/exchange-name.enum';
import { ExchangeDetails } from 'src/common/models/entities/exchange-details.entity';
import { AppException } from 'src/common/models/dtos/app-exception.dto';
import { CalcUtils } from 'src/common/utils/calc-utils.service';
import { TimeUtils } from 'src/common/utils/time-utils.service';

@Injectable()
export class ExchangesFactory {
  private exchanges: Map<string, ExchangeFetcherService>;

  constructor(
    private readonly calcs: CalcUtils,
    private readonly timeUtils: TimeUtils,
  ) {
    this.exchanges = new Map<string, ExchangeFetcherService>();
    this.exchanges.set(ExchangeName.BYBIT, new BybitFetcherService());
    this.exchanges.set(ExchangeName.BINANCE, new BinanceFetcherService());
  }

  getFetcher(exchange: ExchangeDetails): ExchangeFetcherService {
    let service = this.exchanges.get(exchange.name);
    if (service) {
      service = service.init(exchange, this.calcs, this.timeUtils);
      return service;
    }
    throw new AppException(`Exchange service for ${exchange.name} is not supported yet.`);
  }
}
