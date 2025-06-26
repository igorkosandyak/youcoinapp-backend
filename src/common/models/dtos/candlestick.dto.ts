export class Candlestick {
  openTime: Date;
  closeTime: Date;
  high: number;
  low: number;
  close: number;
  volume: number;
  quoteVolume: number;
  trades: number;
  baseAssetVolume: number;
  quoteAssetVolume: number;

  constructor(
    openTime: number,
    intervalMinutes: number,
    high: number,
    low: number,
    close: number,
    volume: number,
  ) {
    this.openTime = new Date(openTime);
    this.closeTime = new Date(openTime + intervalMinutes * 60 * 1000);
    this.high = high;
    this.low = low;
    this.close = close;
    this.volume = volume;
  }
}
