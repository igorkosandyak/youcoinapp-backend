import { IsString, IsNotEmpty } from 'class-validator';

export class TradeSignalDto {
  @IsString()
  @IsNotEmpty()
  pair: string;

  @IsString()
  @IsNotEmpty()
  price: string;

  @IsString()
  @IsNotEmpty()
  action: string;
}
