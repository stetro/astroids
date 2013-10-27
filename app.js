/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var io = require('socket.io');
var crypto = require("crypto");

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', routes.index);

var server = http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});

var websocket = io.listen(server);

websocket.sockets.on('connection', function(socket) {
	var hash = generateUniqueHash();
	socket.on('collectShipData', function(data) {
		data.name = hash;
		websocket.sockets.emit("recieveShipData", data);
	});
	socket.on('disconnect', function() {
		websocket.sockets.emit('disconnectShipData', hash);
	});
});

var generateUniqueHash = function() {
	var current_date = (new Date()).valueOf().toString();
	var random = Math.random().toString();
	return crypto.createHash('sha1').update(current_date + random).digest('hex');
};