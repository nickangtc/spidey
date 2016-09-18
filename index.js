var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var ejsLayouts = require('express-ejs-layouts');
var session = require('express-session');
var passport = require('./config/ppConfig'); // require('passport') done in ppConfig

// ============= MIDDLE WARE + CONFIGURATIONS ==============

app.use(express.static(__dirname + '/static'));
app.set('view engine', 'ejs');

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
// initialize the passport configuration and session as middleware
app.use(passport.initialize());
app.use(passport.session()); // this must come after use(session) - dependency

// /auth/login, /logout, /signup routes
app.use('/', require('./controllers/auth'));

// ============== ROUTES =============
// READ: get homepage
app.get('/', function (req, res) {
  console.log('GET / request received');
  res.render('index');
});

// READ: get user's starred urls (user must be logged in)
// TODO: dependent on savedUrl.js model
app.get('/users/:id/stars', function (req, res) {
  console.log('GET /users/id request received');
  console.log('id:', req.params.id);
  console.log('cookie:', req.user);
  // render user_starred
  res.render('user_starred');
});

// READ: get user profile (user must be logged in)
// TODO: dependent on savedUrl.js model
app.get('/users/:id', function (req, res) {
  console.log('GET /users/id request received');
  res.render('user_profile');
});

// UPDATE: update user profile (user must be logged in)
// TODO: dependent on savedUrl.js model
app.put('/users/:id', function (req, res) {
  console.log('PUT /users/id request received');
  console.log('id:', req.params.id);
  console.log('req.body:', req.body);
  // update db

  // if successful (validated)
  // ^ redirect to get '/users/:id'
  res.redirect('/users/:id');
});

// READ: get user account edit form (user must be logged in)
app.get('/users/:id/edit', function (req, res) {
  console.log('GET /users/id/edit request received');
  console.log('id:', req.params.id);
  // render user_profile_edit
  res.render('user_profile_edit');
});

// DESTROY: delete user account
app.delete('/users/:id', function (req, res) {
  // TODO: not sure how to implement yet
});

app.listen(3000);
