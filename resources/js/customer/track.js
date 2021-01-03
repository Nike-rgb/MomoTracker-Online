import './../../scss/scss.scss';
import io from 'socket.io-client';

//['Order-placed', 'Received', 'Prepared', 'On the way', 'Completed'];
let order = JSON.parse(document.querySelector('.order-carrier').dataset.order);
let orderStatus = Array.from(document.querySelector('.order-status').children);

(function updateOrderStatus(order){
  for(let status of orderStatus) {
    if(status.innerText == order.status) {
      //change color to orange and break the loop
      status.style.color = "orange";
      status.firstChild.style.transform = "scale(1.3)";
      break;
    }
    //ongoing status
    status.style.color = "#4BB543";
  }


})(order);

//client socket
const socket = io();

//join a room
socket.emit('join', order._id);

socket.on('updateStatus', newStatus => {
  for(let status of orderStatus) {
    if(status.innerText == newStatus) {
      //change color to orange and break the loop
      status.style.color = "orange";
      status.firstChild.style.transform = "scale(1.3)";
      break;
    }
    //completed status
    status.style.color = "#4BB543";
  }
});
