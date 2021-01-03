module.exports = homeController;

const Menu = require('../../models/menu');

function homeController() {
 return {
   index(req, res){
     Menu.find({}, (err, pizzas) => {
      res.render('index' , {
      title : "Momos'-Order Now!",
      pizzas : pizzas,
     });
     })
   }
 }
}
