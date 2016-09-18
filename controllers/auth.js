var express = require('express');
var router = express.Router();
// use passport to handle auth
var passport = require('../config/ppConfig');
var db = require('../models');

// READ: get signup form
router.get('/signup', function (req, res) {
  console.log('GET /auth/signup request received');

  res.render('auth/signup');
});

// READ: get login form
router.get('/login', function (req, res) {
  console.log('GET /auth/login request received');

  res.render('auth/login');
});

// POST: login info
router.post('/login', passport.authenticate('local', {
  // authenticate happens in config/ppConfig.js
  successRedirect: '/',
  failureRedirect: '/auth/login'
}));

// POST: signup new user
// handle signup based on form input
router.post('/signup', function (req, res) {
  console.log('POST /auth/signup request received');
  console.log('req.body:', req.body);
  db.user.findOrCreate({
    where: { email: req.body.email },
    defaults: {
      name: req.body.name,
      password: req.body.password
    }
  }).spread(function (user, created) {
    if (created) {
      // replace the contents of this if statement with the code below
      passport.authenticate('local', {
        successRedirect: '/'
      })(req, res);
    } else {
      console.log('Email already exists');
      res.redirect('/auth/signup');
    }
  }).catch(function (error) {
    console.log('An error occurred: ', error.message);
    res.redirect('/auth/signup');
  });
});

// use Passport to handle logout
router.get('/logout', function (req, res) {
  req.logout();
  console.log('logged out');
  res.redirect('/');
});

module.exports = router;
