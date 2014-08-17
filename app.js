var port = process.env.PORT || 3000;
var _ = require('underscore');
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

var hourPriceDist = [];
var dayPriceDist = [];
var weekPriceDist = [];

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
});

function handleTrade(trade) {
  io.sockets.emit('trade', trade);
  mongo.saveTrade(trade);
}

var startPriceDistLoop = function(timeframe, dataCache, period) {
  mongo.getPriceDist(timeframe, function(error, data) {
    if (error) console.error(error);
    else dataCache = data;
    io.sockets.emit('priceDistData', dataCache);
    setTimeout(function() {
      startPriceDistLoop(timeframe, dataCache, period);
    }, period)
  });
};

startPriceDistLoop(60*60*1000, hourPriceDist, 30*1000);


server.listen(port, function() {
  console.log('listening on port', port);
});

// TODO:
// are bitfinex trades being emitted in the correct order?
// bitfinex and btce adding duplicate trades