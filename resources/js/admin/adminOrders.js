import './../../scss/scss.scss';
import axios from 'axios';
import io from "socket.io-client";
import moment from 'moment';

let selects = document.querySelectorAll('.select');

selects.forEach(select => {
  select.onchange = changeOrderStatus;
});

function slideAndFade(elem) {
  elem.style.transform = "translateX(300px)";
  elem.style.opacity = "0";
  setTimeout(() => {
    elem.remove();
  }, 2000);
}

//changing the order status by admin
function changeOrderStatus(event) {
  let target = event.currentTarget;
  let id = target.dataset.orderId;
  let options = Array.from(target.children);
  let selected;
  let chosen;
  options.forEach(option => {
    if(option.selected) {
      selected = option.value;
      chosen = option;
    }
  });
  let icon = target.nextElementSibling.children[0];
  icon.style.color = "yellow";
  icon.style.animation = "shake 2s ease infinite";
  //send ajax request to server and there change the order Status
  axios.post('/admin/changeOrderStatus', {id , selected}).then(res => {
    if(res.data.error) {
      icon.style.color = "red";
      chosen.previousElementSibling.selected = true;
    }

    if(res.data.completed) return slideAndFade(target.parentElement.parentElement.parentElement);
    icon.style.animation = "none";
    icon.style.color = "#4BB543";
    setTimeout(() => {
      icon.style.color = "orange";
    }, 1500);
  });
}


const orderStatus = ['Order-placed', 'Received', 'Prepared', 'On the way', 'Completed'];
let orderThead = document.querySelector('.order-thead');
const socket = io();

socket.on('newOrder', ({order, customer}) => {
  let pizzaNames = '';
  for(let pizza of Object.values(order.items)) {
    pizzaNames += `<li>${pizza.item.name}</li> `;
  }

  let orderOptions = '';
  for(let status of orderStatus) {
    if(status == 'Order-placed') {
      orderOptions += `<option selected>${status}</option> `;
    } else {
      orderOptions += `<option value="${status}">${status}</option>`;
    }
  }

  let markup = `
    <div class="col-span-3">
      <ul>
        <li> ${order._id} </li>
        ${pizzaNames}
      </ul>
    </div>
    <div class="col-span-1">${customer}</div>
    <div class="col-span-1">${order.address}</div>
    <div style="position : relative" class="col-span-2">
      <select onchange="changeOrderStatus(event)" data-order-id="${order._id}">
      ${orderOptions};
      </select>
      <span style="position : absolute; top : 42%; left : 48%;">
        <i style="font-size : 30px; color : orange" class="lab la-centercode"></i>
      </span>
      </div>
      <div class="col-span-1">${moment(order.createdAt).format('hh : mm A')}</div>
    `;

    let newOrder = document.createElement('div');
    newOrder.classList.add('grid');
    newOrder.classList.add('grid-cols-8');
    newOrder.classList.add('order-row');
    newOrder.innerHTML = markup;
    newOrder.style.transtion = "all 3s ease;"
    orderThead.after(newOrder);
});
