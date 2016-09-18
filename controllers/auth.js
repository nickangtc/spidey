var express = require('express');
var router = express.Router();
// use passport to handle auth
var passport = require('../config/ppConfig');
var db = require('../models');

router.get('/signup', function (req, res) {
  res.render('auth/signup');
});

router.get('/login', function (req, res) {
  res.render('auth/login');
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login'
}));

// handle signup based on form input
router.post('/signup', function (req, res) {
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
