var socket = io.connect();
var template = _.template('<tr><td><span data-livestamp="<%=date%>">a few seconds ago</span></td><td><%=price%></td><td><%=amount%></td><td><%=exchange%></td></tr>');
var $tradeTable = $('table.table');
var $headerRow = $('tr.headerRow:first');

socket.on('connect', function() {
  console.log('hello');
});
socket.on('trade', function(trade) {
  console.log(trade);
  trade.date = Math.floor(trade.date/1000);
  $headerRow.after(template(trade));
});