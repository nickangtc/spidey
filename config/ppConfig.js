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
  db.user.find({
    where: { email: email }
  }).then(function (user) {
    if (!user || !user.validPassword(password)) {
      cb(null, false);
    } else {
      cb(null, user);
    }
  }).catch(cb);
}));

// export the Passport configuration from this module
module.exports = passport;
