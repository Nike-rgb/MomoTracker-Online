const mongoose = require('mongoose');

const Menu = mongoose.model('Menu', new mongoose.Schema({
  "name": {type : String, required : true, unique : true},
  "image": String,
  "price": Number,
  "size": String
  })
);

module.exports = Menu;
