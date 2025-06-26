import { Module } from '@nestjs/common';
import { GlobalExceptionFilter } from './filters/exceptions.filter';
import { ExchangesFactory } from 'src/integrations/services/external-exchanges/exchanges.factory';
import { CalcUtils } from './utils/calc-utils.service';
import { TimeUtils } from './utils/time-utils.service';
import { MarketLogSchema } from './models/entities/market-log.entity';
import { MarketLog } from './models/entities/market-log.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { ExchangeDetails } from './models/entities/exchange-details.entity';
import { ExchangeDetailsSchema } from './models/entities/exchange-details.entity';
import { StringUtils } from './utils/string-utils.service';

export * from './models';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExchangeDetails.name, schema: ExchangeDetailsSchema },
      { name: MarketLog.name, schema: MarketLogSchema },
    ]),
  ],
  providers: [
    GlobalExceptionFilter,
    ExchangesFactory,
    CalcUtils,
    TimeUtils,
    StringUtils,
  ],
  exports: [
    GlobalExceptionFilter,
    ExchangesFactory,
    CalcUtils,
    TimeUtils,
    StringUtils,
  ],
})
export class CommonModule {}
