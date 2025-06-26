import { MarketCondition } from 'src/common/enums/market-condition.enum';

export class BollingerBands {
  value: number;
  upperLevel: number;
  lowerLevel: number;
  middleLevel: number;
  marketCondition: MarketCondition;

  constructor(
    bollingerPbValue: number,
    upper: number,
    lower: number,
    middle: number,
  ) {
    this.value = bollingerPbValue;
    this.upperLevel = upper;
    this.lowerLevel = lower;
    this.middleLevel = middle;
    this.marketCondition = this._getMarketCondition(this.value);
  }

  _getMarketCondition(avgPB: number): MarketCondition {
    if (avgPB <= 0.2) {
      return MarketCondition.SUPER_BEARISH;
    } else if (avgPB > 0.2 && avgPB <= 0.4) {
      return MarketCondition.BEARISH;
    } else if (avgPB > 0.4 && avgPB <= 0.6) {
      return MarketCondition.SIDEWAYS;
    } else if (avgPB > 0.6 && avgPB <= 0.8) {
      return MarketCondition.BULLISH;
    } else {
      return MarketCondition.SUPER_BULLISH;
    }
  }
}
