import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountStatus } from 'src/common/enums/account-status.enum';
import { AccountDto } from 'src/common/models/dtos/account.dto';
import {
  Account,
  AccountDocument,
} from 'src/common/models/entities/account.entity';

@Injectable()
export class AccountsRepository {
  constructor(
    @InjectModel(Account.name)
    private readonly accountModel: Model<AccountDocument>,
  ) {}

  async createAccount(dto: AccountDto): Promise<Account> {
    const account = new this.accountModel({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      status: dto.status || AccountStatus.ACTIVE,
      exchanges: [],
    });
    return account.save();
  }

  async findByEmail(email: string): Promise<Account> {
    return await this.accountModel.findOne({ email: email }).exec();
  }

  async findById(accountId: string): Promise<Account> {
    return await this.accountModel.findOne({ _id: accountId }).exec();
  }

  async findByStatusAndWithProviders(
    status: AccountStatus,
  ): Promise<Account[]> {
    return await this.accountModel
      .find({ status: status })
      .populate('exchanges')
      .exec();
  }
}
