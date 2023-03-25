import express, { Request, Response } from 'express';
import { ExchangeRate } from '../models/exchange-rate';

const router = express.Router();

let exchangeRates: ExchangeRate[] = [];

router.get('/', (req: Request, res: Response) => {
  res.render('exchange-rates', { exchangeRates });
});

router.post('/', (req: Request, res: Response) => {
  const id = exchangeRates.length + 1;
  const fromCurrency = req.body.fromCurrency;
  const toCurrency = req.body.toCurrency;
  const date = req.body.date;
  const rate = parseFloat(req.body.rate);
  const exchangeRate = new ExchangeRate(id, fromCurrency, toCurrency, date, rate);
  exchangeRates.push(exchangeRate);
  res.redirect('/exchange-rates');
});

router.post('/delete/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  exchangeRates = exchangeRates.filter(exchangeRate => exchangeRate.id !== id);
  res.redirect('/exchange-rates');
});

export default router;