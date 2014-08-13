var port = process.env.PORT || 3000;
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var logger = require('morgan');
var mongo = require('./mongo');
var bitstamp = require('./listeners/bitstamp');
var bitfinex = require('./listeners/bitfinex');
var hitbtc = require('./listeners/hitbtc');
var btce = require('./listeners/btce');
var anxbtc = require('./listeners/anxbtc');

app.use(logger('dev'));
app.use(express.static(__dirname + '/public'));

bitstamp.on('trade', handleTrade);
bitfinex.on('trade', handleTrade);
hitbtc.on('trade', handleTrade);
btce.on('trade', handleTrade);
anxbtc.on('trade', handleTrade);
function handleTrade(trade) {
  io.sockets.emit('trade', trade);
  mongo.saveTrade(trade);
}

server.listen(port, function() {
  console.log('listening on port', port);
});