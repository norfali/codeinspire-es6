// Runs a local web server to host files
var express = require('express'),
		path = require('path'),
		app = express();

// Routes for html and assets
app.use('/', express.static(path.join(__dirname, '/.tmp/html')));
app.use('/', express.static(path.join(__dirname, '/')));

// Start the server
var server = app.listen(3000, function () {
  var host = 'localhost';
  var port = server.address().port;
  console.log('Running a local server at http://%s:%s', host, port);
});