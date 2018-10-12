var express = require('express');
const BodyParser = require('body-parser');
var User = require('../models/user');

var router = express.Router();
router.use(BodyParser.json());

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

router.post('/signup', function(req,res,next) {
  User.findOne({ username: req.body.username})
  .then((user) => {
    if (user != null){
      var err = new Error('User ' + req.body.username + ' already exists');
      err.status = 403;
      next(err);
    }
    else {
      return User.create({
        username: req.body.username,
        password: req.body.password
      });
    }
  })
  .then((user) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({status: 'Registration Successful', user: user});
  }, (err) => next(err))
  .catch((err) => next(err));
});

router.post('/login', (req,res,next) => {

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

    User.findOne({username: username})
    .then((user) => {
      if (user === null) {
        var err = new Error('User: ' + username + ' not found!');
        err.status = 403;
        next(err);
      }
      // TODO: check if !== correct
      else if (user.password !== password) {
        var err = new Error('Your password is incorrect!');
        err.status = 403;
        next(err);
      }
      else if(user.username === username && user.password === password){                        // hardcoding the UN:PW for the moment
        req.session.user = 'authenticated';
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');                                                                   // OK to continue to next middleware
        res.end('You are authenticated');
      }
    })
    .catch((err) => next(err));
  }
  else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already authenticated!');
  }
});

router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else {
    var err  = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

module.exports = router;
