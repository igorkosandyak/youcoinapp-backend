import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { MarketLogDto, TimeframeLogDto } from 'src/common/models/dtos/market-log.dto';
import { MarketLog } from 'src/common/models/entities/market-log.entity';
import { ExchangeDetails } from 'src/common/models/entities/exchange-details.entity';
import { ExchangeFetcherService } from 'src/integrations/services/external-exchanges/exchange-fetcher.service';
import { MarketType } from 'src/common/enums/market-type.enum';
import { CalcUtils } from 'src/common/utils/calc-utils.service';
import { TimeUtils } from 'src/common/utils/time-utils.service';
import { IndicatorsService } from './indicators.service';
import { MarketLogCreatorService } from './market-log-creator.service';
import { VectorEncoderService } from 'src/learning/services/vector-encoder.service';
import { MarketLogRepository } from '../repositories/market-log.repository';

@Injectable()
export class MarketLogFetcherService {
  private readonly logger = new Logger(MarketLogFetcherService.name);

  constructor(
    private readonly calcUtils: CalcUtils,
    private readonly timeUtils: TimeUtils,
    private readonly indicators: IndicatorsService,
    private readonly marketLogCreatorService: MarketLogCreatorService,
    @Inject(forwardRef(() => VectorEncoderService))
    private readonly vectorEncoderService: VectorEncoderService,
    private readonly repository: MarketLogRepository,
  ) {}

  async fetchForSymbol(pair: string): Promise<MarketLog | null> {
    this.logger.log(`Fetching market log for pair: ${pair}`);
    return null;
  }

  async fetchForExchange(exchangeDetails: ExchangeDetails, exchangeService: ExchangeFetcherService) {
    const BASE_ASSET = 'USDT';
    const ASSETS = exchangeDetails.settings.usdtPairs;
    const timeframes = ['5m', '15m', '1h', '4h'];
    const lastPrices: Record<string, number> = await exchangeService.getSpotLatestPrices();
    const dtos: MarketLogDto[] = [];

    for (const from of ASSETS) {
      const pair = `${from}USDT`;
      const orderbook = await exchangeService.getSpotOrderbook(from, BASE_ASSET);
      const prPrecision = this.calcUtils.getPricePrecision(orderbook);
      const amPrecision = this.calcUtils.getAmountPrecision(orderbook);
      const obi = this.indicators.getOBI(orderbook);

      const currentPrice = pair.includes('1000') ? lastPrices[pair.replace('/', '')] * 1000 : lastPrices[pair];
      const logDto = new MarketLogDto(MarketType.SPOT, from, BASE_ASSET, currentPrice, prPrecision, amPrecision, obi);

      for (const interval of timeframes) {
        const candles = await exchangeService.getSpotCandles(from, BASE_ASSET, interval);

        const last2Candles = candles.slice(-3).slice(0, 2);
        const bands = this.indicators.getBollingerBands(candles);
        const timeframeDto = TimeframeLogDto.fromIndicators(
          this.indicators.getRSI(candles),
          this.indicators.getCCI(candles),
          this.indicators.getEma(candles),
          this.indicators.getSma(candles),
          this.indicators.getAtr(candles),
          this.indicators.getTrend(candles),
          this.indicators.getMarketPressure(candles),
          this.indicators.getMarketCondition(candles),
          bands,
          this.indicators.getStochasticOscillator(candles),
          this.indicators.getMACD(candles),
          last2Candles,
          this.calcUtils.calculateVolatilityPercent(bands.upperLevel, bands.lowerLevel),
          candles,
        );
        if (interval === '5m') {
          logDto._5minTimeframe = timeframeDto;
          const candlesData = logDto._5minTimeframe.lastCandleCloses;
          if (candles?.[0]) {
            logDto.change_3min = this.calcUtils.calcPercentDiffBetweenPrices(candlesData[0].close, currentPrice);
          }
          if (candles?.[1]) {
            logDto.change_6min = this.calcUtils.calcPercentDiffBetweenPrices(candlesData[1].close, currentPrice);
          }
          if (candles?.[2]) {
            logDto.change_9min = this.calcUtils.calcPercentDiffBetweenPrices(candlesData[2].close, currentPrice);
          }
        }

        if (interval === '15m') {
          logDto._15minTimeframe = timeframeDto;
          const candlesData = logDto._15minTimeframe.lastCandleCloses;
          if (candles?.[0]) {
            logDto.change_15min = this.calcUtils.calcPercentDiffBetweenPrices(candlesData[0].close, currentPrice);
          }
          if (candles?.[1]) {
            logDto.change_30min = this.calcUtils.calcPercentDiffBetweenPrices(candlesData[1].close, currentPrice);
          }
          if (candles?.[2]) {
            logDto.change_45min = this.calcUtils.calcPercentDiffBetweenPrices(candlesData[2].close, currentPrice);
          }
        }
        if (interval === '1h') {
          logDto._1hTimeframe = timeframeDto;
          const candlesData = logDto._1hTimeframe.lastCandleCloses;
          if (candles?.[0]) {
            logDto.change_1h = this.calcUtils.calcPercentDiffBetweenPrices(candlesData[0].close, currentPrice);
          }
          if (candles?.[1]) {
            logDto.change_2h = this.calcUtils.calcPercentDiffBetweenPrices(candlesData[1].close, currentPrice);
          }
          if (candles?.[2]) {
            logDto.change_3h = this.calcUtils.calcPercentDiffBetweenPrices(candlesData[2].close, currentPrice);
          }
        }
        if (interval === '4h') {
          logDto._4hTimeframe = timeframeDto;
          const candlesData = logDto._4hTimeframe.lastCandleCloses;
          if (candles?.[0]) {
            logDto.change_4h = this.calcUtils.calcPercentDiffBetweenPrices(candlesData[0].close, currentPrice);
          }
          if (candles?.[1]) {
            logDto.change_8h = this.calcUtils.calcPercentDiffBetweenPrices(candlesData[1].close, currentPrice);
          }
          if (candles?.[2]) {
            logDto.change_12h = this.calcUtils.calcPercentDiffBetweenPrices(candlesData[2].close, currentPrice);
          }
        }
        await this.timeUtils.wait(300);
      }

      dtos.push(logDto);
    }

    const logsToSave = dtos.map((dto: MarketLogDto) => {
      const log = dto.toDbMarketLog();
      log.vectorData = this.vectorEncoderService.encode(log);
      return log;
    });
    return await this.marketLogCreatorService.insert(logsToSave);
  }

  async findUncheckedProfitabilityLogsBatch(batchSize: number, skip: number): Promise<MarketLog[]> {
    return await this.repository.findUncheckedProfitabilityLogsBatch(batchSize, skip);
  }

  async findUncheckedProfitabilityLogsBatchFromLast24Hours(
    batchSize: number,
    skip: number,
    last24Hours: Date,
  ): Promise<MarketLog[]> {
    return await this.repository.findUncheckedProfitabilityLogsBatchFromLast24Hours(batchSize, skip, last24Hours);
  }

  async findLogsByAssetAndTimeWindow(from: string, startTime: Date, hoursWindow: number): Promise<MarketLog[]> {
    return await this.repository.findLogsByAssetAndTimeWindow(from, startTime, hoursWindow);
  }

  async findProfitableLogs(): Promise<MarketLog[]> {
    return await this.repository.findProfitableLogs();
  }

  async findProfitableLogsFromLast24Hours(last24Hours: Date): Promise<MarketLog[]> {
    return await this.repository.findProfitableLogsFromLast24Hours(last24Hours);
  }
}
