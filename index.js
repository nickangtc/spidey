var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var ejsLayouts = require('express-ejs-layouts');

// ============= MIDDLE WARE + CONFIGURATIONS ==============

app.use(express.static(__dirname + '/static'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(ejsLayouts);

// ============== ROUTES =============
// READ: get homepage
app.get('/', function (req, res) {
  res.render('index');
});

// READ: get new user creation form
app.get('/users/new', function (req, res) {
  // render user_new
  res.render('user_new');
});

// CREATE: register new user
app.post('/users', function (req, res) {
  // if successful (validated, no matches in db)
  // ^ redirect to get '/'

  // if unsuccessful (user exists)
  // ^ redirect to get '/users/new' with flash msg

  // if user exists - redirect to 'login'
  console.log('req:', req);
  console.log('req.body:', req.body);
  res.render('index');
});

// READ: get profile
app.get('/users/:id/starred', function (req, res) {
  // render user_starred
  res.render('user_starred');
});

// READ: get user profile edit form
app.get('/users/:id/edit', function (req, res) {
  // render user_profile_edit
  res.render('user_profile_edit');
});

// UPDATE: update user profile
app.put('/users/:id', function (req, res) {
  // update db

  // if successful (validated)
  // ^ redirect to get '/users/:id'
});

// DESTROY: delete user account
app.delete('/users/:id', function (req, res) {
  // TODO: not sure how to implement yet
});

app.listen(3000);
