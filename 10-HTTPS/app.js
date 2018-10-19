var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var passport = require('passport');
var authenticate = require('./authenticate');
var config = require('./config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');

const mongoose = require('mongoose');

const Dishes = require('./models/dishes');
const Promotions = require('./models/promotions');
const Leaders = require('./models/leaders');

const url = config.mongoUrl;
const connect = mongoose.connect(url);

connect.then((db) => {
  console.log('Connect correctly to the server');
}, (err) => { console.log(err);});

var app = express();

app.all('*', (req, res, next) => {
  if (req.secure){
    //already coming to the secure port as flag is true
    return next();
  }
  else {
    // redirecting to the secure port
    res.redirect(307,
      'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
});

app.set('views', path.join(__dirname, 'views'));                                // view engine setup
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

app.use(function(req, res, next) {                                              // catch 404 and forward to error handler
  next(createError(404));
});

app.use(function(err, req, res, next) {                                         // error handler
  res.locals.message = err.message;                                             // set locals, only providing error in development
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);                                                // render the error page
  res.render('error');
});

module.exports = app;
