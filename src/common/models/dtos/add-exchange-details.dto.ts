import { Type } from 'class-transformer';
import { IsEmail, ValidateNested } from 'class-validator';
import { ExchangeDetailsDto } from './exchange-details.dto';

export class AddExchangeDetailsDto {
  @IsEmail()
  accountEmail: string;

  @ValidateNested()
  @Type(() => ExchangeDetailsDto)
  exchange: ExchangeDetailsDto;
}
