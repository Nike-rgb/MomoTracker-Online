import axios from 'axios';
import Noty from 'noty';
import './../scss/scss.scss';

let addToCart = document.querySelectorAll('.add-to-cart');
let totalCounter = document.querySelector('.total-counter');
let loginBtn = document.querySelector('.login-button');
let registerFlash = document.querySelector('.register-flash');
let orderAddress = document.querySelector('.order-address');
let orderBtn = document.querySelector('.order-btn');

//what happens when you click on the add button

let pressedBtn;

addToCart.forEach(btn => {
  btn.addEventListener('click' , () => {
    btn.style.transition = "transform 2s ease";
    btn.style.background = "yellow";
    pressedBtn = btn;
    let pizza = JSON.parse(btn.dataset.pizza);
    updateCart(pizza);
  })
});


//function to send post request with the pizza info
function updateCart(pizza) {
  axios.post('/update-cart', pizza).then(res =>{
    pressedBtn.style.background = "#FE5F1E";
    totalCounter.innerText = res.data.totalQty;
    new Noty({
      themes : "sunset",
      layout : "bottomRight",
      type : 'success',
      timeout : 2000,
      text: 'Item added to the cart',
    }).show();
  }).catch(err => {
    new Noty({
      themes : "sunset",
      layout : "bottomRight",
      type : 'error',
      timeout : 2000,
      text: `Error : Couldn't add to cart`,
    }).show();
  });
}
