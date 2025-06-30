import { ExchangeDetails } from '../entities/exchange-details.entity';
import { BaseMessageDto } from './base-message.dto';

export class MarketLogCollectionJobDataDto extends BaseMessageDto {
  exchangeDetails: ExchangeDetails;

  constructor(exchangeDetails: ExchangeDetails) {
    super('market-log-collection');
    this.exchangeDetails = exchangeDetails;
  }
}
