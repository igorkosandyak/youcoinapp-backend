import { ExchangeDetails } from '../entities/exchange-details.entity';

export class MarketLogCollectionJobDataDto {
  exchangeDetails: ExchangeDetails;

  constructor(exchangeDetails: ExchangeDetails) {
    this.exchangeDetails = exchangeDetails;
  }
}
