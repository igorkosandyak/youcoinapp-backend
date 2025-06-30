import { Injectable } from '@nestjs/common';
import { AccountsRepository } from '../repositories/accounts.repository';
import { AccountDto } from 'src/common/models/dtos/account.dto';
import { Account } from 'src/common/models/entities/account.entity';
import { AppException } from 'src/common/models';
import { AccountStatus } from 'src/common/enums/account-status.enum';

@Injectable()
export class AccountsService {
  constructor(private readonly repository: AccountsRepository) {}

  async create(accountDto: AccountDto): Promise<Account> {
    if (await this._existsByEmail(accountDto.email)) {
      throw new AppException('Account with this email already created', 400);
    } else {
      return await this.repository.createAccount(accountDto);
    }
  }

  async getAccount(accountId: string, email: string): Promise<Account> {
    if (!accountId && !email) {
      throw new AppException('Either id or email is required to get account details', 400);
    }
    if (accountId) {
      return await this.getById(accountId);
    }
    if (email) {
      return await this.getByEmail(email);
    }
  }

  async getActiveAccountsWithProviders(): Promise<Account[]> {
    return await this.repository.findByStatusAndWithProviders(AccountStatus.ACTIVE);
  }

  async getByEmail(email: string): Promise<Account> {
    const account = await this.repository.findByEmail(email.toLowerCase());
    if (!account) {
      throw new AppException('No account found by this email', 404);
    }
    return account;
  }

  async getById(id: string): Promise<Account> {
    const account = await this.repository.findById(id);
    if (!account) {
      throw new AppException('No account found by this id', 404);
    }
    return account;
  }

  private async _existsByEmail(email: string): Promise<boolean> {
    const existingAccount = await this.repository.findByEmail(email.toLowerCase());
    const exists = existingAccount !== null;
    return exists;
  }
}
