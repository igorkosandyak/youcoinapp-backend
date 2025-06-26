import { Body, Controller, Post } from '@nestjs/common';
import { ExchangeSettingsService } from '../services/exchange-settings.service';
import { AddExchangeDetailsDto } from 'src/common/models/dtos/add-exchange-details.dto';

@Controller('exchange-details')
export class ExchangeSettingsController {
  constructor(
    private readonly exchangeSettingsService: ExchangeSettingsService,
  ) {}

  @Post('v1')
  async addExchangeToAccount(@Body() addExchangeDto: AddExchangeDetailsDto) {
    return await this.exchangeSettingsService.addExchangeDetails(
      addExchangeDto,
    );
  }
}
