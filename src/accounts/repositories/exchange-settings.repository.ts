import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StringUtils } from 'src/common/utils/string-utils.service';
import { ExchangeName } from 'src/common/enums/exchange-name.enum';
import { MarketType } from 'src/common/enums/market-type.enum';
import { TradingStatus } from 'src/common/enums/trading-status.enum';
import { ExchangeDetails, ExchangeDetailsDocument } from 'src/common/models/entities/exchange-details.entity';
import { AddExchangeDetailsDto } from 'src/common/models/dtos/add-exchange-details.dto';
import { RelatesTo } from 'src/common/enums/relates-to.enum';

@Injectable()
export class ExchangeSettingsRepository {
  constructor(
    @InjectModel(ExchangeDetails.name)
    private readonly exchangeDetailsModel: Model<ExchangeDetailsDocument>,
    private readonly stringUtils: StringUtils,
  ) {}

  async addExchangeDetails(dto: AddExchangeDetailsDto, accountId: string): Promise<ExchangeDetails> {
    const exchange = new this.exchangeDetailsModel({
      name: dto.exchange.name,
      market: dto.exchange.market,
      status: dto.exchange.status,
      apiKey: dto.exchange.apiKey,
      secretKey: dto.exchange.secretKey,
      settings: dto.exchange.settings,
      relatesTo: dto.exchange.relatesTo,
      tradingStrategy: dto.exchange.tradingStrategy,
      telegramId: dto.exchange.telegramId,
      entryStrategies: dto.exchange.entryStrategies,
      accountId: this.stringUtils.toObjectId(accountId),
    });

    return exchange.save();
  }

  async existsByAccountIdAndNameAndMarket(
    accountId: string,
    name: ExchangeName,
    market: MarketType,
  ): Promise<ExchangeDetails> {
    return await this.exchangeDetailsModel
      .findOne({
        accountId: this.stringUtils.toObjectId(accountId),
        name: name,
        market: market,
      })
      .exec();
  }

  async findByStatusAndMarket(status: TradingStatus, market: MarketType): Promise<ExchangeDetails[]> {
    return await this.exchangeDetailsModel
      .find({
        status: status,
        market: market,
      })
      .exec();
  }

  async findById(exchangeId: Types.ObjectId): Promise<ExchangeDetails> {
    return await this.exchangeDetailsModel.findOne({ _id: exchangeId });
  }

  async findByStatusAndRelatesTo(status: TradingStatus, relatesTo: RelatesTo): Promise<ExchangeDetails[]> {
    return await this.exchangeDetailsModel
      .find({
        status: status,
        relatesTo: relatesTo,
      })
      .exec();
  }
}
