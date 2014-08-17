var port = process.env.PORT || 3000;
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mongo = require('./mongo');
var bitstamp = require('./listeners/bitstamp');
var bitfinex = require('./listeners/bitfinex');
var hitbtc = require('./listeners/hitbtc');
var btce = require('./listeners/btce');
var anxbtc = require('./listeners/anxbtc');
var priceDist;
var priceDistTimeframe = 1000*60*60*24;
var priceDistUpdateFrequency = 60*1000;

app.use(express.static(__dirname + '/public'));

bitstamp.on('trade', handleTrade);
bitfinex.on('trade', handleTrade);
hitbtc.on('trade', handleTrade);
btce.on('trade', handleTrade);
anxbtc.on('trade', handleTrade);

io.on('connection', function(socket) {
  socket.on('getTrades', function(min) {
    min = min || 0;
    mongo.getTrades(min, function(error, trades) {
      if (error) console.error('Error getting trades:', error);
      socket.emit('arrayOfTrades', trades);
    });
  });
  socket.on('getPriceDistData', function() {
    socket.emit('priceDistData', priceDist);
  });
});

function handleTrade(trade) {
  io.sockets.emit('trade', trade);
  mongo.saveTrade(trade);
};

var priceDistLoop = function() {
  mongo.getPriceDist(priceDistTimeframe, function(error, data) {
    if (error) {
      console.error(error);
    } else {
      priceDist = data;
      io.sockets.emit('priceDistData', data);
    }
    setTimeout(priceDistLoop, priceDistUpdateFrequency);
  });
};
priceDistLoop();

server.listen(port, function() {
  console.log('listening on port', port);
});

// TODO:
// are bitfinex trades being emitted in the correct order?