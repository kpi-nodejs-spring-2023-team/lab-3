import { Currency } from "./currency";

export class ExchangeRate {
  id: number;
  fromCurrency: Currency;
  toCurrency: Currency;
  date: string;
  rate: number;

  constructor(id: number, fromCurrency: Currency, toCurrency: Currency, date: string, rate: number) {
    this.id = id;
    this.fromCurrency = fromCurrency;
    this.toCurrency = toCurrency;
    this.date = date;
    this.rate = rate;
  }
}
