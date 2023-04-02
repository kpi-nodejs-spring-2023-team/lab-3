import {ExchangeRate} from "../models/exchange-rate";
import {CurrencyService} from "./currency-service";

export class ExchangeRateService {
    private lastId: number;
    private exchangeRates: ExchangeRate[];

    constructor(private currencyService: CurrencyService) {
        this.lastId = 0;
        this.exchangeRates = [];
    }

    getExchangeRates() {
        return this.exchangeRates;
    }

    getExchangeRatesOnDay(date: Date) {
        return this.exchangeRates.filter(x => x.date.getDay() === date.getDay());
    }

    getExchangeRateById(id: number) {
        return this.exchangeRates.find(c => c.id === id);
    }

    getExchangeRatesForCurrencyOnDates(currencyId: number, fromDate: Date, toDate: Date) {
        return this.exchangeRates.filter(r => r.fromCurrency.id === currencyId && r.date >= fromDate && r.date <= toDate);
    }

    addExchangeRate(date: Date, fromCurrencyId: number, toCurrencyId: number, rate: number) {
        if (fromCurrencyId === toCurrencyId) {
            throw new Error("Cannot set rate to same currency!");
        }

        let existingRates = this.exchangeRates.filter(r => r.date == date
            && r.fromCurrency.id == fromCurrencyId && r.toCurrency.id == toCurrencyId);

        if (existingRates.length !== 0) {
            throw new Error("There is already the rate for these currencies on this date!");
        }

        let fromCurrency = this.currencyService.getCurrencyById(fromCurrencyId);
        if (!fromCurrency) {
            throw new Error("FromCurrency is missing");
        }

        let toCurrency = this.currencyService.getCurrencyById(toCurrencyId);
        if (!toCurrency) {
            throw new Error("ToCurrency is missing");
        }
        
        let straightExchangeRate = new ExchangeRate(this.lastId++, fromCurrency, toCurrency, date, rate);
        this.exchangeRates.push(straightExchangeRate);

        let reversedExchangeRate = new ExchangeRate(this.lastId++, toCurrency, fromCurrency, date, 1 / rate);
        this.exchangeRates.push(reversedExchangeRate);
    }

    deleteExchangeRateById(id: number) {
        let index = this.exchangeRates.findIndex(c => c.id === id);

        if (index > -1) {
            this.exchangeRates.splice(index, 1);
        }
    }
}