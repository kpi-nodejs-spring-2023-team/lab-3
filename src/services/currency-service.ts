import { Currency } from "../models/currency";

export class CurrencyService {
    private lastId: number;
    private currencies: Currency[];

    constructor() {
        this.lastId = 0;
        this.currencies =  [];
    }

    getCurrencies() {
        return this.currencies;
    }

    getCurrencyById(id: number) {
        return this.currencies.find(c => c.id === id);
    }

    addCurrency(name: string) {
        var currency = new Currency(this.lastId++, name);
        this.currencies.push(currency);

        return currency.id;
    }

    updateCurrency(currency: Currency) {
        let index = this.currencies.findIndex(c => c.id === currency.id);
        this.currencies[index] = currency;
    }

    deleteCurrencyById(id: number) {
        let index = this.currencies.findIndex(c => c.id === id);
        this.currencies.splice(index);
    }
}