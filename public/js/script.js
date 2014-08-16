var socket = io.connect();
var template = _.template('<tr class="trade"><td><%=hours%>:<%=minutes%>:<%=seconds%></td><td><%=price%></td><td><%=amount%></td><td><%=exchange%></td></tr>');
var $tradeTable = $('table.table');
var $headerRow = $('tr.headerRow:first');
var digits = 2; // Number of digits for formatting price and ammount

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
  fTrade.exchange = trade.exchange;
  return fTrade;
}

socket.on('connect', function() {
  console.log('hello');
});
socket.on('trade', function(trade) {
  trade = formatTrade(trade);
  $headerRow.after(template(trade));
});