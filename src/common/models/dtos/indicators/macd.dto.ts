export class Macd {
  value: number;
  signal: number;
  histogram: number;

  constructor(value: number, signal: number, histogram: number) {
    this.value = value;
    this.signal = signal;
    this.histogram = histogram;
  }
}
