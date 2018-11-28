const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

// declaring the router at one end point from which we will be
// able to specify further points
favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {
  res.sendStratus(200);
})
// this action is user specific, so user needs to be logged in
.get(cors.cors, authenticate.verifyUser,(req,res,next) => {
  Favorites.findOne({user: req.user._id})
  .populate('user')
  .populate('favoriteDishes')
  .then((favorites) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    // should return the complete list of favorites populated for both
    // user and dishes
    res.json(favorites);
  }, (err) => next(err))
  .catch((err) => next(err));
})
// body contains an array of {"_id": "<dishes id>"}
// should return the updated list of favorites but without population
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorites.findOne({user: req.user._id})
  .then((favorites) => {
    if (favorites != null) {
      // check if the dishes are not already in the list
      req.body.forEach( (x,i,arr) => {
        var isIncluded = favorites.favoriteDishes.some(item => {
          return item._id.toString() === x._id;
        });
        if (!isIncluded) {
            favorites.favoriteDishes.push(x);
        }
      });
      favorites.save()
      .then((favorites) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorites);
        }, (err) => next(err))
        .catch((err) => next(err));
    }
    else {
      Favorites.create({
        user: req.user._id,
        favoriteDishes: req.body
      })
      .then((favorites) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorites);
      }, (err) => next(err))
      .catch((err) => next(err));
    }
  }, (err) => next(err))
  .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
  Favorites.remove({})
  .then((favorites) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(favorites);
  }, (err) => next(err))
  .catch((err) => next(err));
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => {
  res.sendStratus(200);
})
// Same as above post but dishId in URL should be used; nothing in req.body
// returning: the Favorties document creted (only the one created) but with no population
// of users nor dishes e.g. just the idObject of both
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorites.findOne({user: req.user._id})
  .then((favorites) => {
    if (favorites != null) {
      // checking if dish already inside
      var isIncluded = favorites.favoriteDishes.some(item => {
        return item._id.toString() === req.params.dishId
      });
      if (!isIncluded) {
        favorites.favoriteDishes.push({"_id": req.params.dishId});
      }
      favorites.save()
      .then((favorites) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorites);
        }, (err) => next(err))
        .catch((err) => next(err));
    }
    else {
      Favorites.create({
        user: req.user._id,
        favoriteDishes: [{"_id": req.params.dishId}]
      })
      .then((favorites) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorites);
      }, (err) => next(err))
      .catch((err) => next(err));
    }
  }, (err) => next(err))
  .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
  // check if user has some favorites
  Favorites.findOne({user: req.user._id})
  .then((favorites) => {
    if (favorites != null) {
      // check if dish is part of favorites
      var isIncluded = favorites.favoriteDishes.some(item => {
        return item._id.toString() === req.params.dishId
      });
      if (isIncluded) {
        favorites.favoriteDishes.pull({_id: req.params.dishId});
        favorites.save()
        .then((favorites) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorites);
        }, (err) => next(err))
        .catch((err) => next(err));
      }
      else {
        err = new Error('Dish: ' + req.params.dishId + ' is not part of your favorites!');
        err.status = 404;
        return next (err);
      }
    }
    else {
      err = new Error('You have no favorite dishes registred');
      err.status = 404;
      return next (err);
    }
  }, (err) => next(err))
  .catch((err) => next(err));
});

module.exports = favoriteRouter;
