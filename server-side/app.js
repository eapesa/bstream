var express = require('express');
var cons = require('consolidate');
var http = require('http');
var nconf = require('nconf');
var path = require('path');
var crypto = require('crypto');

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
        var json_logs = JSON.parse(logs);
        var dom = json_logs.from.split('@');
        var hfrom = crypto.createHash('md5').update(dom[0]).digest('hex');
        json_logs.from = 'BABBLER_' + hfrom.substr(hfrom.length - 5) + '@' + dom[1];
        
        socket.emit('logs', { data : JSON.stringify(json_logs) });
        
        socket.on('response', function (data) {
            console.log('CLIENT RESPONSE: ' + JSON.stringify(data));
        });
    });
});

/*
var dir = path.join(__dirname, '../');

app.configure(function(){
    app.use(express.static(dir + '/'));
});

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
 */

server.listen(nconf.get('app:port1'), nconf.get('app:host'), function() {
    console.log('Server listening on ' + nconf.get('app:host') + ':' + nconf.get('app:port1'));
});