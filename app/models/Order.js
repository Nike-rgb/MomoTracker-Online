const mongoose = require('mongoose');

const Order = mongoose.model('order', new mongoose.Schema({
  "customer" : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'User',
    required : true,
  },
  'items' : { type : Object, required : true,},
  "address": {type : String, required : true},
  "paymentType" : {type : String, default : "COD",},
  "status" : {type : String, default : 'Order-placed'},
}, {timestamps : true,})
);

module.exports = Order;
