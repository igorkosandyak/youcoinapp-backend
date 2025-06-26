import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Provider } from '@nestjs/common';
import { UserRole } from 'src/common/enums/user-role.enum';
import { AccountStatus } from 'src/common/enums/account-status.enum';

@Schema({ timestamps: true })
export class Account extends Document {
  @Prop({ type: String, unique: true, required: true, index: true })
  email: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    required: true,
    default: UserRole.USER,
  })
  role: UserRole;

  @Prop({ nullable: true })
  telegramId: string;

  @Prop({
    type: String,
    enum: Object.values(AccountStatus),
    default: AccountStatus.ACTIVE,
  })
  status: AccountStatus;

  providers?: Provider[];
}

export type AccountDocument = Account & Document;

export const AccountSchema = SchemaFactory.createForClass(Account);
