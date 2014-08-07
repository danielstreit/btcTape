var port = process.env.PORT || 3000;
var io = require('socket.io').listen(port);
var bitstamp = require('./listeners/bitstamp.js');
bitstamp.on('trade', handleTrade);

function handleTrade(trade) {
  console.log(trade);
  io.sockets.emit('trade', trade);
}

console.log('socket.io listening on port', port);