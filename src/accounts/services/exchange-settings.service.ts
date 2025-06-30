import { Injectable } from '@nestjs/common';
import { ExchangeSettingsRepository } from '../repositories/exchange-settings.repository';
import { AppException, ExchangeDetails } from 'src/common/models';
import { AccountsService } from './accounts.service';
import { MarketType } from 'src/common/enums/market-type.enum';
import { TradingStatus } from 'src/common/enums/trading-status.enum';
import { Types } from 'mongoose';
import { ExchangeName } from 'src/common/enums/exchange-name.enum';
import { AddExchangeDetailsDto } from 'src/common/models/dtos/add-exchange-details.dto';
import { RelatesTo } from 'src/common/enums/relates-to.enum';

@Injectable()
export class ExchangeSettingsService {
  constructor(
    private readonly repository: ExchangeSettingsRepository,
    private readonly accountService: AccountsService,
  ) {}

  async addExchangeDetails(dto: AddExchangeDetailsDto): Promise<ExchangeDetails> {
    const account = await this.accountService.getByEmail(dto.accountEmail);
    const exchange = dto.exchange;
    if (await this._existsInAccount(account.id, exchange.name, exchange.market)) {
      throw new AppException('This exchange already registered for your account!', 404);
    } else {
      return await this.repository.addExchangeDetails(dto, account.id);
    }
  }

  async findAllActiveExchangesByMarket(market: MarketType): Promise<ExchangeDetails[]> {
    return await this.repository.findByStatusAndMarket(TradingStatus.ACTIVE, market);
  }

  async findActiveSystemExchanges(): Promise<ExchangeDetails[]> {
    return await this.repository.findByStatusAndRelatesTo(TradingStatus.ACTIVE, RelatesTo.SYSTEM);
  }

  async findById(exchangeId: Types.ObjectId): Promise<ExchangeDetails> {
    return await this.repository.findById(exchangeId);
  }

  private async _existsInAccount(accountId: string, name: ExchangeName, market: MarketType): Promise<boolean> {
    const existingExchange = await this.repository.existsByAccountIdAndNameAndMarket(accountId, name, market);
    const exists = existingExchange !== null;
    return exists;
  }
}
