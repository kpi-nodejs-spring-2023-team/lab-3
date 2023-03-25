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
  sessionStorage.removeItem("token");
  res.redirect('/');
});

app.get('/currencies', (req, res) => {
  const token = req.cookies.token;
  res.render('currencies', { currencies: currencyService.getCurrencies(), isAuthenticated: isTokenValid(token) });
});

app.post('/currencies', checkAuthenticated, (req, res) => {
  currencyService.addCurrency(req.body.name);
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
  currencyService.deleteCurrencyById(parseInt(req.params.id));
  res.redirect('/currencies');
});

app.get('/exchange-rates', (req, res) => {
  const token = req.cookies.token;
  res.render('exchange-rates', { exchangeRates: exchangeRateService.getExchangeRates(), isAuthenticated: isTokenValid(token)});
});

app.post('/exchange-rates', checkAuthenticated, (req, res) => {
  exchangeRateService.addExchangeRate(req.body.fromCurrency, req.body.toCurrency, req.body.date, parseFloat(req.body.rate));
  res.redirect('/exchange-rates');
});

app.post('/exchange-rates/delete/:id', checkAuthenticated, (req, res) => {
  exchangeRateService.deleteExchangeRateById(parseInt(req.params.id));
  res.redirect('/exchange-rates');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
