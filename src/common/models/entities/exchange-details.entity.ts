import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Document } from 'mongoose';
import { USDT_TRADE_ASSETS } from 'src/common/constants/asset-names.constants';
import { ExchangeName } from 'src/common/enums/exchange-name.enum';
import { MarketType } from 'src/common/enums/market-type.enum';
import { TradeMode } from 'src/common/enums/trade-mode.enum';
import { TradingStatus } from 'src/common/enums/trading-status.enum';
import { EnterStrategyName } from 'src/common/enums/entry-strategy-name.enum';
import { SpotStrategy } from 'src/common/enums/spot-order-strategy.enum';
import { RelatesTo } from 'src/common/enums/relates-to.enum';

@Schema()
export class StrategyConfig {
  @Prop({
    type: String,
    enum: Object.values(EnterStrategyName),
    required: true,
  })
  name: EnterStrategyName;

  @Prop({
    type: String,
    enum: Object.values(TradeMode),
    required: true,
    default: TradeMode.DEMO,
  })
  mode: TradeMode;
}

const StrategyConfigSchema = SchemaFactory.createForClass(StrategyConfig);

@Schema()
class ExchangeSettings {
  @Prop({
    type: [String],
    default: USDT_TRADE_ASSETS,
  })
  usdtPairs: string[];

  @Prop({ type: [String], default: [] })
  btcPairs: string[];

  @Prop({ type: [String], default: [] })
  ethPairs: string[];

  @Prop({ required: false })
  positionAmount: number;

  @Prop({ required: false })
  leverage: number;

  @Prop({ required: false })
  slPercent: number;

  @Prop({ required: false })
  rrr: number;

  @Prop({ required: false })
  orderIntervalMinutes: number;

  @Prop({ required: true })
  baseAsset: string;

  @Prop({ required: true })
  batchesQty: number;

  @Prop({ required: true })
  batchOrdersQty: number;

  @Prop({ required: true, default: 0.0015 })
  exchangeFee: number;

  @Prop({ required: true, default: 2.0 })
  earningPercent: number;

  @Prop({ required: true, default: 100.0 })
  demoOrderBaseAmount: number;

  @Prop({ required: true, default: 10.5 })
  liveOrderBaseAmount: number;
}

const ExchangeSettingsSchema = SchemaFactory.createForClass(ExchangeSettings);

@Schema({ collection: 'exchange-details' })
export class ExchangeDetails extends Document {
  @Prop({ type: String, enum: Object.values(ExchangeName), required: true })
  name: ExchangeName;

  @Prop({ type: String, enum: Object.values(MarketType), required: true })
  market: MarketType;

  @Prop({ type: String, enum: Object.values(RelatesTo), required: true })
  relatesTo: RelatesTo;

  @Prop({
    type: [StrategyConfigSchema],
    required: true,
    default: [
      {
        name: EnterStrategyName.MOMENTUM_INDICATORS,
        mode: TradeMode.DEMO,
      },
    ],
  })
  entryStrategies: StrategyConfig[];

  @Prop({
    type: String,
    enum: Object.values(SpotStrategy),
    required: true,
    default: SpotStrategy.GRID,
  })
  tradingStrategy: SpotStrategy;

  @Prop({
    type: String,
    enum: Object.values(TradingStatus),
    default: TradingStatus.ACTIVE,
  })
  status: TradingStatus;

  @Prop({ required: true })
  apiKey: string;

  @Prop({ required: true })
  secretKey: string;

  @Prop({ type: ExchangeSettingsSchema, required: true })
  settings: ExchangeSettings;

  @Prop({ type: Types.ObjectId, ref: 'Account', required: true })
  accountId: Types.ObjectId;

  @Prop({ required: true })
  telegramId: string;
}

export type ExchangeDetailsDocument = ExchangeDetails & Document;

export const ExchangeDetailsSchema =
  SchemaFactory.createForClass(ExchangeDetails);
