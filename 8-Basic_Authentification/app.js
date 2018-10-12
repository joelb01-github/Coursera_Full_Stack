var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

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

app.set('views', path.join(__dirname, 'views'));                                // view engine setup
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser('12345-12345-12345-12345'));                               // providing secret key
app.use(session({                                                               // launching session middleware
  name: 'session-id',
  secret: '12345-12345-12345-12345',
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}));

function auth(req, res, next){
  console.log(req.session);
  if (!req.session.user){                                                 // meaning user hasn't authenticated himself yet
    var authHeader = req.headers.authorization;                                 // fetching the auth header sent by Client

    if (!authHeader){                                                           // Authorization header not supplied
      var err = new Error('You are not authenticated!');                        // Challenging Client to provide it
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      next(err);                                                                // Will be handled by the error handler
    }

    var auth = new Buffer.from(authHeader.split(' ')[1], 'base64')              // extracting the header, looking at 2nd element of the 1st split array that is the base64 encoded string (User/PW) 2nd split array is the actual username and PW
       .toString().split(':');
    var username = auth[0];
    var password = auth[1];

    if(username === 'admin' && password === 'password'){                        // hardcoding the UN:PW for the moment
      req.session.user = 'admin';
      //res.cookie('user', 'admin', {signed: true});
      next();                                                                   // OK to continue to next middleware
    }
    else {
      var err = new Error('Wrong username and/or PW!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      next(err);
    }
  }
  else {
    // if (req.signedCookies.user === 'admin'){                                    // means contains the right information
    if (req.session.user === 'admin'){
      next();
    }
    else {
      var err = new Error('You are not authenticated!');                        // Challenging Client to provide it
      err.status = 401;
      next(err);
    }
  }
}

app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
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
