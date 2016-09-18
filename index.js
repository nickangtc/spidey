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

// READ: get new user creation form
app.get('/users/new', function (req, res) {
  console.log('GET /users/new request received');
  // render user_new
  res.render('user_new');
});

// CREATE: register new user
app.post('/users', function (req, res) {
  console.log('POST /users request received');
  console.log('req.body:', req.body);
  // if successful (validated, no matches in db)
  // ^ redirect to get '/'

  // if unsuccessful (user exists)
  // ^ redirect to get '/users/new' with flash msg

  // if user exists - redirect to 'login'
  res.render('index');
});

// READ: get profile
app.get('/users/:id/starred', function (req, res) {
  console.log('GET /users/id request received');
  console.log('id:', req.params.id);
  console.log('cookie:', req.user);
  // render user_starred
  res.render('user_starred');
});

// READ: get user profile edit form
app.get('/users/:id/edit', function (req, res) {
  console.log('GET /users/id/edit request received');
  console.log('id:', req.params.id);
  // render user_profile_edit
  res.render('user_profile_edit');
});

// UPDATE: update user profile
app.put('/users/:id', function (req, res) {
  console.log('PUT /users/id request received');
  console.log('id:', req.params.id);
  console.log('req.body:', req.body);
  // update db

  // if successful (validated)
  // ^ redirect to get '/users/:id'
});

// DESTROY: delete user account
app.delete('/users/:id', function (req, res) {
  // TODO: not sure how to implement yet
});

app.listen(3000);
