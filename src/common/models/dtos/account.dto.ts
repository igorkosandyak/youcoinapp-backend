import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { AccountStatus } from 'src/common/enums/account-status.enum';

export class AccountDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  telegramId: string;

  @IsOptional()
  @IsEnum(AccountStatus)
  status: AccountStatus;
}
