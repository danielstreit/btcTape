var socket = io.connect();
socket.on('connect', function() {
  console.log('hello');
});
socket.on('trade', function(trade) {
  console.log(trade);
});