import './../../scss/scss.scss';
import axios from 'axios';

let dismiss = document.querySelectorAll('.dismissOrderIcon');
dismiss.forEach(dismissIcon => {
  dismissIcon.onclick = dismissOrder;
});

function dismissOrder(event) {
  let icon = event.currentTarget;
  let id = icon.dataset.id;
  icon.style.animation = "shake 2s infinite";
  icon.style.color = "yellow";
  axios.post('/cart/dismissorder', {id}).then(res => {
    icon.style.color = "#4BB543";
    icon.style.animation = "none";

    //update the changes in total quantity and total price
    document.querySelector('.total-counter').innerText = res.data.totalQty;
    document.querySelector('.total-price').innerText = res.data.totalPrice;

    slideAndFade(icon.parentElement);
    setTimeout(() => {
      icon.style.color = "orange";
    }, 3000);
  }).catch(() => {
    icon.style.color = "red";
    icon.style.animation = "none";
    setTimeout(() => {
      icon.style.color = "orange";
    }, 3000);
  });
}

function slideAndFade(elem) {
  elem.style.transform = "translateX(300px)";
  elem.style.opacity = "0";
  setTimeout(() => {
    elem.remove();
  }, 2000);
}
