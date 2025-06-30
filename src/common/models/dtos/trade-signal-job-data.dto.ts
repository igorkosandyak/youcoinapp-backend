import { BaseMessageDto } from './base-message.dto';
import { TradeSignalDto } from './trade-signal.dto';

export class TradeSignalJobDataDto extends BaseMessageDto {
  signal: TradeSignalDto;
  receivedAt: string;

  constructor(signal: TradeSignalDto) {
    super('trade-signal');
    this.signal = signal;
    this.receivedAt = new Date().toISOString();
  }
}
