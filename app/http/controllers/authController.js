const User = require('../../models/user');
const bcrypt = require('bcrypt');
const passport = require('passport');
function authController() {
 return {
   loginIndex(req, res){
       res.render('auth/login.ejs' , {
         title : "Log in to your account.",
       });
   },

   registerIndex(req, res){
     res.render('auth/register.ejs' , {
       title : "Register to Pizza",
     });
   },

   async register(req, res){
     const {name , email, password} = req.body;

     //hash password using bcrypt
     const hashedPassword = await bcrypt.hash(password, 10);

     //checking if the email exits
     User.findOne({email : email}, (err, user) => {
       if(user) {
         req.flash('error', 'Email already taken.');
         req.flash('name', name);
         req.flash('email', email);
         return res.redirect('/register');
       } else {
         new User({
           name,
           email,
           password : hashedPassword,
         }).save((err, savedUser) => {
           if(err) {
             req.flash('error', "Something went wrong. Try again.");
             return res.redirect('/register');
           } else {
             //login
             return res.redirect('/login');
           }
         });
       }
     });
   },

   login(req, res) {
     passport.authenticate('local', (err, user, info) => {
       if(err) {
         req.flash('error', info.message);
         return res.redirect('/login');
       }

       if(!user) {
         req.flash('error', info.message);
         return res.redirect('/login');
       }

       req.logIn(user, (err) => {
         if(err) {
           req.flash('error', info.message);
           return res.redirect('/login');
         }
         req.flash('error', info.message);
         res.redirect('/cart');
       });
     }) (req, res);
   },

   logout(req, res) {
     req.logout();
     res.redirect('/');
   },

 }
}

module.exports = authController;
