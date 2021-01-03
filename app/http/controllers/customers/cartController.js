module.exports = cartController;

function cartController() {
 return {
   index(req, res){
      res.render('Customers/cart.ejs' , {
        title : "Your cart-Momos'",
      });
   },

   //format in which the data will be saved in the sessions
   //let cart = {
   //items : {
   //pizzaId:{item : pizzaObj, qty:0}
   //},
   //totalQty : 0,
   //totalPrice : 0,
   //}

   update(req, res){
     //if this is the first time adding to the cart
     if(!req.session.cart) {
       req.session.cart = {
         items : {},
         totalQty : 0,
         totalPrice : 0,
       }
     }
       //fetching the newly made or previously existing cart
       let cart = req.session.cart;
       if(!cart.items[req.body._id]) {
         cart.items[req.body._id] = {
           item : req.body,
           qty : 1,
         }
       } else {
         cart.items[req.body._id].qty += 1;
       }
         cart.totalQty += 1;
         cart.totalPrice += req.body.price;
       //these are accessible through res.data
       return res.json({'totalQty' : cart.totalQty, });
    },

    dismissOrder(req, res) {
      let {id} = req.body;
      let items = req.session.cart.items;
      let qtyDeduct = items[id].qty;
      let price = items[id].item.price;
      let priceDeduct = qtyDeduct * price;
      delete items[id];
      //deduct in total price
      req.session.cart.totalPrice -= priceDeduct;
      req.session.cart.totalQty -= qtyDeduct;
      res.json({totalQty : req.session.cart.totalQty, totalPrice : req.session.cart.totalPrice});
    },
   }
 }
