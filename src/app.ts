import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { Currency } from './models/currency';
import { CurrencyService } from './services/currency-service';
import { ExchangeRateService } from './services/exchange-rate-service';
import { UserService } from './services/user-service';

const app = express();
const port = 3000;

const userService = new UserService();
const currencyService = new CurrencyService();
const exchangeRateService = new ExchangeRateService(currencyService);

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: 'some_secret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(cookieParser());

function isTokenValid(token: string | undefined) {
  return token && userService.isTokenValid(token);
}

function checkAuthenticated(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token;
  if (isTokenValid(token)) {
    return next();
  }
  res.redirect('/login');
}

function checkNotAuthenticated(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token;
  if (!isTokenValid(token)) {
    return next();
  }
  res.redirect('/');
}

app.get('/', (req, res) => {
  const token = req.cookies.token;
  res.render('index', { isAuthenticated: isTokenValid(token) });
});

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login');
});

app.post('/login', checkNotAuthenticated, (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  let token = userService.login(email, password);
  res.cookie('token', token);

  res.redirect("/")
});

app.get('/logout', (req, res) => {
  res.cookie('token', '');
  res.redirect('/');
});

app.get('/currencies', (req, res) => {
  const token = req.cookies.token;
  let currencies = currencyService.getCurrencies()
  res.render('currencies', { currencies: currencies, isAuthenticated: isTokenValid(token) });
});

app.get('/currencies/:id', (req, res) => {
  let currencyId = parseInt(req.params.id);
  let currency = currencyService.getCurrencyById(currencyId);
  let fromDateString = <string>req.query.fromDate;
  let toDateString = <string>req.query.toDate;
  const token = req.cookies.token;

  let exchangeRates = exchangeRateService.getExchangeRatesForCurrencyOnDates(currencyId, new Date(fromDateString), new Date(toDateString))

  res.render('currency-history', { currency: currency, exchangeRates: exchangeRates, isAuthenticated: isTokenValid(token), fromDate: fromDateString, toDate: toDateString });
});

app.post('/currencies', checkAuthenticated, (req, res) => {
  let name = req.body.name;
  currencyService.addCurrency(name);
  res.redirect('/currencies');
});

app.get('/currencies/edit/:id', checkAuthenticated, (req, res) => {
  res.render('currency-edit', { currency: currencyService.getCurrencyById(parseInt(req.params.id)) });
});

app.post('/currencies/edit/:id', checkAuthenticated, (req, res) => {
  let currencyToUpdate = new Currency(parseInt(req.params.id), req.body.name)
  currencyService.updateCurrency(currencyToUpdate);
  res.redirect('/currencies');
});

app.post('/currencies/delete/:id', checkAuthenticated, (req, res) => {
  let id = parseInt(req.params.id);
  currencyService.deleteCurrencyById(id);
  res.redirect('/currencies');
});

app.get('/exchange-rates', (req, res) => {
  const token = req.cookies.token;
  let currencies = currencyService.getCurrencies();
  let exchangeRates = exchangeRateService.getExchangeRatesOnDay(new Date());

  res.render('exchange-rates', { currencies: currencies, exchangeRates: exchangeRates, isAuthenticated: isTokenValid(token)});
});

app.post('/exchange-rates', checkAuthenticated, (req, res) => {
  let date = new Date(req.body.date);
  let fromCurrencyId = req.body.fromCurrency;
  let toCurrencyId = req.body.toCurrency;
  let rate = parseFloat(req.body.rate);

  exchangeRateService.addExchangeRate(date, fromCurrencyId, toCurrencyId, rate);

  res.redirect('/exchange-rates');
});

app.post('/exchange-rates/delete/:id', checkAuthenticated, (req, res) => {
  let id = parseInt(req.params.id);
  exchangeRateService.deleteExchangeRateById(id);
  res.redirect('/exchange-rates');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
