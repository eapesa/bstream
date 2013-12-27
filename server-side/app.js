var express = require('express')
var http = require('http');
var path = require('path');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var Tail = require('tail').Tail;
var tail = new Tail('../test.log');

io.sockets.on('connection', function (socket) {
    tail.on('line', function(logs) {
        console.log(logs);
        socket.emit('news', { hello : logs });
    });

    socket.on('my other event', function (data) {
        console.log(data);
    });
});

app.configure(function(){
    var dir = path.join(__dirname, '../');
    app.use(express.static(dir + '/'));
});

app.get('/', function(req, res) {
    res.sendfile('/Users/eapesa/Desktop/Voyager_Git/bstream/socket.io/client.html');
});

server.listen(8080);