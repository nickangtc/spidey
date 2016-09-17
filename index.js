var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var ejsLayouts = require('express-ejs-layouts');

// ============= MIDDLE WARE + CONFIGURATIONS ==============

// app.use(express.static(__dirname + '/static'));
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

});

// CREATE: register new user
app.post('/users', function (req, res) {
  console.log('req:', req);
  console.log('req.body:', req.body);
  res.render('index');
});

// READ: get profile
app.get('/users/:id', function (req, res) {

});

// READ: get user profile edit form
app.get('/users/:id/edit', function (req, res) {

});

// UPDATE: update user profile
app.put('/users/:id', function (req, res) {

});

// DESTROY: delete user account
app.delete('/users/:id', function (req, res) {

});

app.listen(3000);
