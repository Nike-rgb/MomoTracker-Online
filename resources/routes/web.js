const homeController = require('../../app/http/controllers/homeController.js');
const authController = require('../../app/http/controllers/authController.js');
const cartController = require('../../app/http/controllers/customers/cartController.js');
const passport = require('passport');
const guest = require('./../../app/http/middlewares/guest.js');
const orderController = require('../../app/http/controllers/customers/orderController.js');
const adminOrderController = require('../../app/http/controllers/admin/adminOrderController.js');
const user = require('./../../app/http/middlewares/user.js');
const admin = require('./../../app/http/middlewares/admin.js');

function initRoutes(app) {

  app.get('/' , homeController().index);

  app.get('/cart' , cartController().index);

  app.post('/cart/dismissorder', cartController().dismissOrder);

  app.get('/login' , guest, authController().loginIndex);

  app.get('/register', guest, authController().registerIndex);

  app.get('/logout', user, authController().logout);

  app.post('/update-cart', cartController().update);

  app.post('/register', authController().register);

  app.post('/login', authController().login);

  app.post('/order', user, orderController().store);

  app.get('/customers/orders', user, orderController().index);

  app.get('/customers/orders/:id', user, orderController().show);

  //admin routes
  app.get('/admin/orders', admin, adminOrderController().index);

  app.post('/admin/changeOrderStatus', admin, adminOrderController().changeOrderStatus);

}

module.exports = initRoutes;
