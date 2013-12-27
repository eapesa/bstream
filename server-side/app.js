var express = require('express')
var http = require('http');
var nconf = require('nconf');
var path = require('path');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

nconf.use('file', {
    file: '../config.json'
});

var Tail = require('tail').Tail;
var tail = new Tail(nconf.get('logs:path'));

io.sockets.on('connection', function (socket) {
    tail.on('line', function(logs) {
        console.log(logs);
        socket.emit('logs', { data : logs });
    });

    socket.on('response', function (data) {
        console.log('CLIENT RESPONSE: ' + data);
    });
});


app.configure(function(){
    var dir = path.join(__dirname, '../');
    app.use(express.static(dir + '/'));
});

app.get('/', function(req, res) {
    res.sendfile('/Users/eapesa/Desktop/Voyager_Git/bstream/socket.io/client.html');
});

server.listen(nconf.get('app:port'), nconf.get('app:host'), function() {
    console.log('Server listening on ' + nconf.get('app:host') + ':' + nconf.get('app:port'));
});