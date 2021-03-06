var express = require('express');
var router = express.Router();
// use passport to handle auth
var passport = require('../config/ppConfig');
var db = require('../models');

router.get('/signup', function (req, res) {
  console.log('GET /signup request received');
  res.render('signup');
});

router.get('/login', function (req, res) {
  console.log('GET /login request received');
  res.render('login');
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  successFlash: 'You have logged in - let\'s get down to business!',
  failureFlash: 'Invalid email and/or password'
}));

// handle signup based on form input
router.post('/signup', function (req, res) {
  db.user.findOrCreate({
    where: { email: req.body.email },
    defaults: {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: req.body.password
    }
  }).spread(function (user, created) {
    if (created) { // new user created
      console.log('created new account');
      passport.authenticate('local', {
        successRedirect: '/',
        successFlash: 'Account created. You\'re now logged in. Welcome :)'
      })(req, res);
    } else { // not created
      req.flash('error', 'Email already exists');
      res.redirect('/signup');
    }
  }).catch(function (error) {
    req.flash('error', error.message);
    res.redirect('/signup');
  });
});

// use Passport to handle logout
router.get('/logout', function (req, res) {
  req.logout();
  console.log('logged out');
  req.flash('success', 'You have logged out. Happy publishing!');
  res.redirect('/');
});

module.exports = router;
