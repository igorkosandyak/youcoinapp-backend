import { Module } from '@nestjs/common';
import { AccountsService } from './services/accounts.service';
import { AccountsRepository } from './repositories/accounts.repository';
import { AccountController } from './controllers/accounts.controller';
import { Account, AccountSchema } from 'src/common/models/entities/account.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { ExchangeDetails, ExchangeDetailsSchema } from 'src/common/models/entities/exchange-details.entity';
import { ExchangeSettingsService } from './services/exchange-settings.service';
import { ExchangeSettingsRepository } from './repositories/exchange-settings.repository';
import { ExchangeSettingsController } from './controllers/exchange-settings.controller';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    CommonModule,
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: ExchangeDetails.name, schema: ExchangeDetailsSchema },
    ]),
  ],

  controllers: [AccountController, ExchangeSettingsController],
  providers: [AccountsService, AccountsRepository, ExchangeSettingsService, ExchangeSettingsRepository],
  exports: [AccountsService, ExchangeSettingsService, ExchangeSettingsRepository],
})
export class AccountsModule {}
