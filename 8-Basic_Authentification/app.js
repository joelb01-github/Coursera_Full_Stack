var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');

const mongoose = require('mongoose');

const Dishes = require('./models/dishes');
const Promotions = require('./models/promotions');
const Leaders = require('./models/leaders');

const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url);

connect.then((db) => {
  console.log('Connect correctly to the server');
}, (err) => { console.log(err);});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

function auth(req, res, next){                                                  // Before the client can access any further middleware, we request authentification
  console.log(req.headers);
  var authHeader = req.headers.authorization;                                   // fetching the auth header sent by Client

  if (!authHeader){                                                             // Authorization header not supplied
    var err = new Error('You are not authenticated!');                          // Challenging Client to provide it
    res.setHeader('WWW-Authenticate', 'Basic');
    err.status = 401;
    next(err);                                                                  // Will be handled by the error handler
  }

  var auth = new Buffer(                                                        // extracting the header, looking at 2nd element of the 1st split array that is the base64 encoded string (User/PW) 2nd split array is the actual username and PW
    authHeader.split(' ')[1], 'base64').toString().split(':');
  var username = auth[0];
  var password = auth[1];

  if(username === 'admin' && password === 'password'){                          // hardcoding the UN:PW for the moment
    next();                                                                     // OK to continue to next middleware
  }
  else {
    var err = new Error('Wrong username and/or PW!');
    res.setHeader('WWW-Authenticate', 'Basic');
    err.status = 401;
    next(err);
  }
}

app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
