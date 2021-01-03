const mongoose = require('mongoose');

const User = mongoose.model('User', new mongoose.Schema({
  "name": {type : String, required : true, unique : false,},
  "email": {type : String, required : true , unique : false,},
  "password": {type : String, required : true},
  "role" : {type : String, default : "customer"},
}, {timestamps : true })
);

module.exports = User;
