import { Injectable } from '@nestjs/common';
import { ExchangeDetailsRepository } from '../repositories/exchange-details.repository';
import { ExchangeDetails } from 'src/common/models/entities/exchange-details.entity';

@Injectable()
export class ExchangeDetailsService {
  constructor(private readonly repository: ExchangeDetailsRepository) {}

  async findAll(): Promise<ExchangeDetails[]> {
    return this.repository.findAll();
  }

  async findById(id: string): Promise<ExchangeDetails> {
    return this.repository.findById(id);
  }
}
