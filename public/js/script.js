var socket = io.connect();
var template = _.template('<tr class="trade"><td><%=hours%>:<%=minutes%>:<%=seconds%></td><td><%=price%></td><td><%=amount%></td><td><%=usd%></td><td><%=exchange%></td></tr>');
var $headerRow = $('tr.headerRow:first');
var $tradeSizeFilter = $('input.tradeSizeFilter');
var digits = 2; // Number of digits for formatting price and ammount
var tradeCount = 0;
var maxTrades = 20;
var minTrade = 0;

var formatTrade = function(trade) {
  var fTrade = {};
  var date = new Date(trade.date);
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  fTrade.hours = '' + date.getHours();
  fTrade.minutes = minutes < 10 ? '0' + minutes : '' + minutes;
  fTrade.seconds = seconds < 10 ? '0' + seconds : '' + seconds;
  fTrade.price = trade.price.toFixed(digits);
  fTrade.amount = trade.amount.toFixed(digits);
  fTrade.usd = '$' + (trade.price * trade.amount).toFixed(digits);
  fTrade.exchange = trade.exchange;
  return fTrade;
}

var removeOldestTrade = function() {
  $('table.table tr:last-child').remove();
  tradeCount--;
};

var clearTrades = function() {
  $('table.table tr.trade').remove();
  tradeCount = 0;
};

var addTrade = function(trade) {
  if (trade.amount > minTrade) {
    trade = formatTrade(trade);
    $headerRow.after(template(trade));
    tradeCount++;
    if (tradeCount > 20) {
      removeOldestTrade();
    }
  }
};

socket.on('connect', function() {
  console.log('hello');
  socket.emit('getTrades', minTrade);
});

socket.on('arrayOfTrades', function(trades) {
  clearTrades();
  trades.reverse().forEach(addTrade);
});

socket.on('trade', function(trade) {
  addTrade(trade);
});

$tradeSizeFilter.change(function() {
  minTrade = $tradeSizeFilter.val();
  socket.emit('getTrades', minTrade);
});