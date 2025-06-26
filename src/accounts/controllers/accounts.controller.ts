import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AccountDto } from 'src/common/models/dtos/account.dto';
import { AppResponse } from 'src/common/models/dtos/app-response.dto';
import { Account } from 'src/common/models/entities/account.entity';
import { AccountsService } from '../services/accounts.service';

@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountsService) {}

  @Post('v1')
  async createAccount(
    @Body() accountDto: AccountDto,
  ): Promise<AppResponse<Account>> {
    return new AppResponse(await this.accountService.create(accountDto));
  }

  @Get('v1')
  async getAccount(
    @Query('id') accountId: string,
    @Query('email') email: string,
  ): Promise<AppResponse<Account>> {
    return new AppResponse(
      await this.accountService.getAccount(accountId, email),
    );
  }
}
