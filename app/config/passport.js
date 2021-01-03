const passport = require('passport');
const User = require('./../models/user.js');
const bcrypt = require('bcrypt');

passport.serializeUser((user, done) => {
  done(null, user._id, );
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  })
});

const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy({usernameField : 'email'}, (email, password, done) => {
  //see if the user with such username exists
  User.findOne({email}, (err, user) => {
    if (err) {
      return done(err, false, {message : "Something went wrong."});
    }

    if(!user) {
      return done(null, false, {message : "No such user exists."});
    }

    //check if the password matches
    bcrypt.compare(password , user.password).then(match => {
      if(!match) {
        return done(null, false, {message : "Password and email doesn't match."});
      }
      done(null, user, {message : "Log in successful"});
    }).catch(err => {
      done(err, false, {message : "Something went wrong. Try again."});
    });
  });
})
);
