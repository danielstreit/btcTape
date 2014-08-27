var port = process.env.PORT || 3000;
var url = process.env.URL || 'localhost';
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var _ = require('underscore');
var CronJob = require('cron').CronJob;
var build = require('./cron/build.js');
var mongo = require('./mongo');
var bitstamp = require('./listeners/bitstamp');
var bitfinex = require('./listeners/bitfinex');
var hitbtc = require('./listeners/hitbtc');
var btce = require('./listeners/btce');
var priceDistTimeframe = 1000*60*60*24;
var priceDistUpdateFrequency = 60*1000;
var day = 1000*60*60*24;
var priceDist;
var summaryData = {};

app.use(express.static(__dirname + '/public'));

bitstamp.on('trade', handleTrade);
bitfinex.on('trade', handleTrade);
hitbtc.on('trade', handleTrade);
btce.on('trade', handleTrade);

io.on('connection', function(socket) {
  socket.on('getTrades', function(min) {
    min = min || 0;
    mongo.getTrades(min, function(error, trades) {
      if (error) console.error('Error getting trades:', error);
      socket.emit('arrayOfTrades', trades);
    });
  });
  socket.on('init', function() {
    socket.emit('summaryData', summaryData);
    socket.emit('priceDistData', priceDist);
  });
});

function handleTrade(trade) {
  io.sockets.emit('trade', trade);
  if (process.env.NODE_ENV === 'production') mongo.saveTrade(trade);
};

var summaryDataLoop = function() {
  mongo.getSummaryData(day, function(error, data) {
    if (error) {
      console.log(error);
    } else {
      _.extend(summaryData, data[0]);
      summaryData.volatility = Math.sqrt(data[0].variance);
      io.sockets.emit('summaryData', summaryData);
    }
    setTimeout(summaryDataLoop, 30*1000);
  });
}
summaryDataLoop();

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

// Set up a cron job to compute summary data to be saved in
// computedValues table
// Should be triggered at 00:30 UTC every day.
var hour = 24 - new Date().getTimezoneOffset()/60;
var job = new CronJob({
  cronTime: '00 30 '+ hour + ' * * *',
  onTick: build,
  start: true
});

server.listen(port, url, function() {
  console.log('listening on port', port);
});