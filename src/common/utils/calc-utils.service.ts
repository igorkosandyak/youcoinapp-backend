import { Injectable } from '@nestjs/common';

@Injectable()
export class CalcUtils {
  constructor() {}

  round(value: any, scale: number): number {
    return parseFloat(parseFloat(value).toFixed(scale));
  }

  calcPercentDiff(numberFrom: number, numberTo: number): number {
    if (numberFrom === 0) {
      return 0;
    }
    const diff = numberFrom - numberTo;
    const percentDiff = (diff / numberFrom) * 100;
    return parseFloat(percentDiff.toFixed(2));
  }

  calcPercentChange(highestPrice: number, currentPrice: number): number {
    if (highestPrice === 0) {
      throw new Error('Highest price cannot be zero.');
    }
    const fall = highestPrice - currentPrice;
    const percentFall = (fall / highestPrice) * 100;

    if (highestPrice > currentPrice) {
      return -parseFloat(percentFall.toFixed(2));
    } else {
      return parseFloat(percentFall.toFixed(2));
    }
  }

  calcPercentDiffBetweenPrices(
    entryPrice: number,
    currentPrice: number,
  ): number {
    if (entryPrice === 0) {
      return 0;
    }
    const diff = currentPrice - entryPrice;
    const percentDiff = (diff / entryPrice) * 100;
    return parseFloat(percentDiff.toFixed(2));
  }

  calcAmountByPercentOfANumber(numberFrom: number, percent: number): number {
    return (numberFrom * percent) / 100;
  }

  calcAmountDiff(numberFrom: number, numberTo: number): number {
    const amountDiff = numberFrom - numberTo;
    return amountDiff;
  }

  calculateVolatilityPercent(upperPrice: number, lowerPrice: number): number {
    return ((upperPrice - lowerPrice) / lowerPrice) * 100;
  }

  addPercent(numberToChange: number, percent: number): number {
    const amountToAdd = (numberToChange * percent) / 100;
    return numberToChange + amountToAdd;
  }

  getPricePrecision(orderbook: any): number {
    const bids = orderbook.bids.slice(0, 5);

    const getDecimalPlaces = (num) => {
      if (!Number.isFinite(num)) return 0;
      const decimalPart = num.toString().split('.')[1];
      return decimalPart ? decimalPart.length : 0;
    };

    let pricePrecision = 0;
    for (const el of bids) {
      pricePrecision = Math.max(pricePrecision, getDecimalPlaces(el[0]));
    }
    return pricePrecision;
  }

  getAmountPrecision(orderbook: any): number {
    const bids = orderbook.bids.slice(0, 5);

    const getDecimalPlaces = (num) => {
      if (!Number.isFinite(num)) return 0;
      const decimalPart = num.toString().split('.')[1];
      return decimalPart ? decimalPart.length : 0;
    };

    let amountPrecision = 0;
    for (const el of bids) {
      amountPrecision = Math.max(amountPrecision, getDecimalPlaces(el[1]));
    }
    return amountPrecision;
  }

  getXMarketBuyPrice(orderBook: any, index: number): number | null {
    return this.getPriceFromOrderBook(orderBook.bids, index);
  }

  getXMarketSellPrice(orderBook: any, index: number): number | null {
    return this.getPriceFromOrderBook(orderBook.asks, index);
  }

  getNumberWithPercentSubtraction(
    amount: number,
    percentSubtraction: number,
  ): number {
    const subtraction = (amount * percentSubtraction) / 100;
    return amount - subtraction;
  }

  private getPriceFromOrderBook(
    prices: number[],
    index: number,
  ): number | null {
    if (index < 1 || index > prices.length) {
      return null;
    }
    return prices[index - 1];
  }
}
