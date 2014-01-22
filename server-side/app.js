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

filter_message = function(msg) {
    var all_badwords = nconf.get('bad_words');
    
    for (var i in all_badwords) {
        var bw = all_badwords[i];
        var bw_length = bw.length;
        var filter = Array(bw_length).join('*');
        var bad_word = new RegExp(bw, 'gi');

        msg = msg.replace(bad_word, filter + bw.substring(bw_length - 1));
    }
    
    return msg;
}

io.sockets.on('connection', function (socket) {
    tail.on('line', function(logs) {
        var json_logs = JSON.parse(logs);
        var dom = json_logs.from.split('@');
        var hfrom = crypto.createHash('md5').update(dom[0]).digest('hex');
        json_logs.from = 'BABBLER_' + hfrom.substr(hfrom.length - 5) + '@' + dom[1];
        json_logs.body = filter_message(json_logs.body);
        
        socket.emit('logs', { data : JSON.stringify(json_logs) });
        
        socket.on('response', function (data) {
            console.log('CLIENT RESPONSE: ' + JSON.stringify(data));
        });
    });
});

server.listen(nconf.get('app:port1'), nconf.get('app:host'), function() {
    console.log('Server listening on ' + nconf.get('app:host') + ':' + nconf.get('app:port1'));
});