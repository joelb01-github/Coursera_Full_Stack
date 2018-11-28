var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var favoriteSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  favoriteDishes: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dish'
    }]
  }
});

module.exports = mongoose.model('Favorites', favoriteSchema);
