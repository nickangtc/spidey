var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var db = require('../models');

// convert user object to serialized object stored in session
passport.serializeUser(function (user, cb) {
  cb(null, user.id);
});

// revert serialized object to user object for interaction with database
passport.deserializeUser(function (id, cb) {
  db.user.findById(id).then(function (user) {
    cb(null, user);
  }).catch(cb);
});

 // local authentication using email and password
 // invoked by passport.authenticate() at POST /login route
passport.use(new LocalStrategy({
  // docs: https://github.com/jaredhanson/passport-local
  // format: new LocalStrategy({/* options */, callback})
  // (options)
  usernameField: 'email', // default: username
  passwordField: 'password', // default: password
  session: true  // use passport to handle sessions (default: true)
}, function (email, password, cb) {  // (callback)
  console.log('email passed to passport:', email);
  console.log('password passed to passport:', password);
  db.user.find({
    where: { email: email }
  }).then(function (user) {
    console.log('(sensitive info) found user with matching email:', user.id, user.name);

    if (!user || !user.validPassword(password)) {
      console.log('!user?', !user);
      console.log('!user.validPassword(password)?', !user.validPassword(password));
      cb(null, false);
    } else {
      console.log('password matches hash in db, logging in');
      cb(null, user);
    }
  }).catch(cb);
}));

// export the Passport configuration from this module
module.exports = passport;
