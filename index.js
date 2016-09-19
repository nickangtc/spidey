var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var ejsLayouts = require('express-ejs-layouts');
var session = require('express-session');
var passport = require('./config/ppConfig'); // require('passport') done in ppConfig
var methodOverride = require('method-override');
var db = require('./models');
var flash = require('connect-flash');

// ============= MIDDLE WARE + CONFIGURATIONS ==============

app.use(express.static(__dirname + '/static'));
app.set('view engine', 'ejs');

// override with POST having ?_method=DELETE / PUT
app.use(methodOverride('_method'));

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(ejsLayouts);
app.use(session({
  secret: process.env.SESSION_SECRET || 'canthashthis',
  resave: false,
  saveUninitialized: true
}));
app.use(flash()); // one-off messages in cookies
// initialize the passport configuration and session as middleware
app.use(passport.initialize());
app.use(passport.session()); // this must come after use(session) - dependency

// middleware to retrieve Flash messages embedded in requests
app.use(function (req, res, next) {
  // before every route, attach the flash messages and current user to res.locals
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  console.log('Flash res.locals.alerts:', res.locals.alerts);
  console.log('Flash res.locals.currentUser:', res.locals.currentUser);
  next();
});

// /auth/login, /logout, /signup routes
app.use('/', require('./controllers/auth'));

// ============== ROUTES =============
// READ: get homepage
app.get('/', function (req, res) {
  console.log('GET / request received');
  if (req.user) {
    res.render('index', { user: req.user });
  } else if (req.user === undefined) {
    res.render('index', {user: ''});
  }
  // res.render('index', { user: req.user });
});

// READ: get user's starred urls (user must be logged in)
app.get('/users/:id/stars', function (req, res) {
  console.log('GET /users/id request received');
  console.log('id:', req.params.id);
  console.log('cookie:', req.user);
  // render user_starred
  res.render('user_starred');
});

// READ: get user profile (user must be logged in)
app.get('/users/:id', function (req, res) {
  console.log('GET /users/id request received');
  res.render('user_profile', { user: req.user });
});

// UPDATE: update user profile (user must be logged in)
app.put('/users/:id', function (req, res) {
  console.log('PUT /users/id request received');
  console.log('id:', req.params.id);
  console.log('req.body:', req.body);
  // update db
  db.user.findById(req.params.id).then(function (user) {
    user.update({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email
    });
  }).then(function () {
    console.log('successfully updated account');
    res.redirect('/users/:id');
  });
});

// READ: get user account edit form (user must be logged in)
app.get('/users/:id/edit', function (req, res) {
  console.log('GET /users/id/edit request received');
  console.log('id:', req.params.id);
  // render user_profile_edit
  res.render('user_profile_edit', { user: req.user });
});

// DESTROY: delete user account
app.delete('/users/:id', function (req, res) {
  // TODO: not sure how to implement yet
});

app.listen(3000);
