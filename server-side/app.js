var express = require('express');
var cons = require('consolidate');
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
var tail = new Tail(nconf.get('path:logfile'));

io.sockets.on('connection', function (socket) {
    tail.on('line', function(logs) {
        socket.emit('logs', { data : logs });
        
        socket.on('response', function (data) {
            console.log('CLIENT RESPONSE: ' + JSON.stringify(data));
        });
    });
});

var dir = path.join(__dirname, '../');

app.configure(function(){
    app.use(express.static(dir + '/'));
});

/*
app.get('/', function(req, res) {
    //res.sendfile('/Users/eapesa/Desktop/Voyager_Git/bstream/socket.io/client.html');
    res.sendfile(dir + 'client-side/index.html');
});
 */
app.get('/', function (req, res) {
    var data = {
        url: nconf.get('path:url'),
        max_entries: nconf.get('miscs:max_entries')
    }
    cons.swig('../client-side/index.html', data, function(err, html) {
		res.writeHead(200, {"Content-Type" : "text/html"});
		res.end(html);
    });
})

server.listen(nconf.get('app:port'), nconf.get('app:host'), function() {
    console.log('Server listening on ' + nconf.get('app:host') + ':' + nconf.get('app:port'));
});