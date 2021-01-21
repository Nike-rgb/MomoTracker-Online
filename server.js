require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const expressLayout = require('express-ejs-layouts');

//setting up the server
const app = express();

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

//setting up the connection with database
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODBURI, {
  useNewUrlParser : true,
  useUnifiedTopology : true,
  useCreateIndex : true,
}).then(() => {
  console.log("Connection was made with database");
}).catch(err => {
  throw err;
});

const connection = mongoose.connection;

//handling session
const session = require('express-session');

const flash = require('express-flash');

const MongodbStore = require('connect-mongo')(session);

//storing sessions

const mongoStore = new MongodbStore({
  mongooseConnection : connection,
  collection : 'sessions',
});

app.use(session({
  secret : process.env.COOKIE_SECRET,
  name : "PizzaCartSession",
  resave : false,
  store : mongoStore,
  saveUninitialized : false,
  cookie : {maxAge : 1000 * 60 * 60 * 4, sameSite : true, httpOnly : true} // 4 hours
}));

//setting up the passport js
const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());
require('./app/config/passport.js');

app.use(flash());

//handling static files
app.use(express.static('./public'));

//parsing the req body
app.use(express.json());
app.use(express.urlencoded({extended : false,}));

//configuring views
app.use(expressLayout);
app.set('views' , './resources/views');
app.set('view engine' , 'ejs');

//global middleware
app.use((req, res, next) => {
  res.locals.cart = req.session.cart;
  res.locals.user = req.user;
  next();
});

//eventemitter
const Emitter = require('events');
const eventEmitter = new Emitter();
app.set('eventEmitter', eventEmitter);

//setting up the server socket
const io = require('socket.io')(server);
io.on('connection', socket => {
  //join a room
  socket.on('join', id => {
    socket.join(id);
  });
});

eventEmitter.on('orderUpdated', data => {
  let {id, status} = data;
  io.to(id).emit('updateStatus', status);
});

eventEmitter.on('newOrder', data => {
  io.emit('newOrder', data);
});

//setting up the routing
require('./resources/routes/web.js')(app);
