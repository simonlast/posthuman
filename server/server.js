
var http = require('http'),
	connect = require('connect'),
	express = require('express'),
	sio = require('socket.io'),
	storage = require('./persist');

var app = express();

app.use(
  connect.static(__dirname + '/../public', { maxAge: 1000*3600*24 })
);

var server = http.createServer(app);

var io = sio.listen(server, {log: false});

server.listen(80);

storage.init();

//storage.setItem('quotes', []);

io.sockets.on('connection', function(socket){
	
	socket.on('addQuote', function(data, fn){
		if(data && data.quote){
			var quotes = storage.getItem('quotes');
			quotes.push(data);
			console.log('added: ' + data.quote);
			storage.setItem('quotes', quotes);
			fn({'quotes':storage.getItem('quotes')});
		}
	});

	socket.on('updateQuote', function(data){
		if(data && data.quote){
			var quotes = storage.getItem('quotes');

		}
	});

	socket.on('getQuotes', function (data, fn) {
 		fn({'quotes':storage.getItem('quotes')});
  	});

});

