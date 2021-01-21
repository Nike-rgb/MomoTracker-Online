const Order = require('../../../models/Order.js');
const moment = require('moment');
function orderController() {
  return {
    store(req, res) {
      const {address} = req.body;
      new Order({
        'customer' : req.user._id,
        'items' : req.session.cart.items,
        address,
      }).save((err, order) => {
        if(err) {
          req.flash('error', "Sorry something went wrong. Try again.");
          return res.redirect('/cart');
        }
        //empty the cart
        delete req.session.cart;
        req.flash('success', "Order placed. It will be on your way soon. Click on the orderId to track it");
        //send the order to server socket
        const eventEmitter = req.app.get('eventEmitter');
        eventEmitter.emit('newOrder', {order, customer : req.user.name});
        res.redirect('/customers/orders');
      });
    },

    async index(req, res){
      try{
        const orders = await Order.find({customer : req.user._id}).populate('customer').sort({'createdAt' : -1});
        res.render('Customers/Order', {
          title : "Your orders-Momos'",
          orders,
          moment : moment,
      });
    } catch (err) {
          if(err) {
            throw err;
            return res.redirect('/customers/orders');
          }
        }
    },

    show(req, res) {
      let id = req.params.id;
      Order.findById(id).populate('customer').exec((err, order) => {
        if(err) return redirect('/customers/orders');
        if(!order) return res.redirect('/customers/orders');
        //authorise user
        if(Object.toString(req.user._id) == Object.toString(order.customer._id)) {
          res.render('Customers/singleOrder', {
            title : 'Track your order-Momo\'s',
            order,
          });
        } else {
          res.redirect('/');
        }
      });
    },

  }
}

module.exports = orderController;
