import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExchangeDetails } from 'src/common/models/entities/exchange-details.entity';

@Injectable()
export class ExchangeDetailsRepository {
  constructor(
    @InjectModel(ExchangeDetails.name)
    private exchangeDetailsModel: Model<ExchangeDetails>,
  ) {}

  async findAll(): Promise<ExchangeDetails[]> {
    return this.exchangeDetailsModel.find();
  }

  async findById(id: string): Promise<ExchangeDetails> {
    return this.exchangeDetailsModel.findById(id);
  }
}
