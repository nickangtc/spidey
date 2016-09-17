var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// ============= MIDDLE WARE + CONFIGURATIONS ==============

// app.use(express.static(__dirname + '/static'));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.set('view engine', 'ejs');

// ============== ROUTES =============
app.get('/', function (req, res) {
  res.render('index');
});

app.post('/users', function (req, res) {
  console.log('req:', req);
  console.log('req.body:', req.body);
  res.render('index');
});

app.get('/greet/:name/:lastname', function (req, res) {
  res.send('Hello ' + req.params.name + ' ' + req.params.lastname);
});

app.get('/multiply/:x/:y', function (req, res) {
  res.send('The answer is: ' + (req.params.x * req.params.y));
});

app.get('/add/:x/:y', function (req, res) {
  res.send('The answer is: ' + (parseInt(req.params.x) + parseInt(req.params.y)));
});

app.listen(3000);
