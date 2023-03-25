import { Currency } from "../models/currency";
import { ExchangeRate } from "../models/exchange-rate";
import { CurrencyService } from "./currency-service";

export class ExchangeRateService {
    private lastId: number;
    private exchangeRates: ExchangeRate[];

    constructor(private currencyService: CurrencyService) {
        this.lastId = 0;
        this.exchangeRates =  [];
    }

    getExchangeRates() {
        return this.exchangeRates;
    }

    getExchangeRatesOnDay(date: string) {
        return this.exchangeRates.filter(x => x.date === date);
    }

    getExchangeRateById(id: number) {
        return this.exchangeRates.find(c => c.id === id);
    }

    addExchangeRate(date: string, fromCurrencyId: number, toCurrencyId: number, rate: number) {     
        var fromCurrency = this.currencyService.getCurrencyById(fromCurrencyId);

        if (!fromCurrency) {
            throw new Error("FromCurrency is undefined");
        }

        var toCurrency = this.currencyService.getCurrencyById(toCurrencyId);

        if (!toCurrency) {
            throw new Error("ToCurrency is undefined");
        }
        
        var exchangeRate = new ExchangeRate(this.lastId++, fromCurrency, toCurrency, date, rate);

        return exchangeRate.id;
    }

    deleteExchangeRateById(id: number) {
        let index = this.exchangeRates.findIndex(c => c.id === id);
        this.exchangeRates.splice(index);
    }
}