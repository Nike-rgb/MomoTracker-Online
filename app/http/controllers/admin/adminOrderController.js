const Order = require('../../../models/Order.js');
const moment = require('moment');

const orderStatus = ['Order-placed', 'Received', 'Prepared', 'On the way', 'Completed'];
module.exports = function (){
  return {
    async index(req, res) {
      try{
        const orders = await Order.find({'status' : {$ne : 'Completed'}}).populate('customer').sort({'createdAt' : -1});
        res.render('admin/orders', {
          title : "Customers' Orders",
          orders,
          moment,
          orderStatus,
        });
      } catch(err) {
        throw err;
      }
    },

    changeOrderStatus(req, res) {
      let {id, selected} = req.body;
      Order.updateOne({_id : id}, {'status' : selected}, (err, updatedOrder) => {
        if(err) {
          return res.json({"error" : "Something went wrong"});
        }
        //emit event
        const eventEmitter = req.app.get('eventEmitter');
        eventEmitter.emit('orderUpdated', {id, status : selected});
        if(selected == "Completed") {
          Order.deleteOne({status : "Completed"}, err => {
            return res.json({completed : true});
          });
        } else res.end();
      });
    },
  }
}
