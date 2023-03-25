import express, { Request, Response } from 'express';
import { Currency } from '../models/currency';

const router = express.Router();

let currencies: Currency[] = [];

router.get('/', (req: Request, res: Response) => {
    res.render('currencies', { currencies });
});

router.post('/', (req: Request, res: Response) => {
    const id = currencies.length + 1;
    const name = req.body.name;
    const currency = new Currency(id, name);
    currencies.push(currency);
    res.redirect('/currencies');
});

router.post('/delete/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    currencies = currencies.filter(currency => currency.id !== id);
    res.redirect('/currencies');
});

export default router;