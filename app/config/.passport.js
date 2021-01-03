const LocalStrategy = require('passport-local').Strategy;
const User = require('./../models/user');
const bcryt = require('bcrypt');

function  init(passport){
  passport.use(new LocalStrategy({
    usernameField : 'email'
  }, (email, password, done) => {
    //check if email exists
    User.findOne({'email' : email} , (err, user) =>{
      if(user){
        bcrypt.compare(password, user.password).then(match => {
          if(match) return done(null, user, {message : "Logged in sucessfully"});
          return done(null, false, {message : "Wrong username or password"});
        }).catch(err => {
          return done(null, false, {message : "Something went wrong. Try again."});
        });

        passport.serializeUser((user, done) => {
          done(null, user._id);
        });

      } else return done(null, false, {message : "No user with this email"});
    })
  }))


}



module.exports = init;
