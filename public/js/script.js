google.load("visualization", "1", {packages:["corechart"]});
var socket = io.connect();
var template = _.template('<tr class="trade"><td><%=hours%>:<%=minutes%>:<%=seconds%></td><td><%=price%></td><td><%=amount%></td><td><%=usd%></td><td><%=exchange%></td></tr>');
var $headerRow = $('tr.headerRow:first');
var $tradeSizeFilter = $('input.tradeSizeFilter');
var digits = 2; // Number of digits for formatting price and ammount
var tradeCount = 0;
var maxTrades = 20;
var minTrade = 0;

var chartsReady = false;
var priceDistChart;
var rawPriceDistData;
var priceDistData;
var priceDistOptions = {
    hAxis: { title: 'Price' },
    vAxis: { title: 'Quantity' },
    theme: 'maximized',
    isStacked: true
};

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
};

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
  socket.emit('getPriceDistData');
});

socket.on('arrayOfTrades', function(trades) {
  clearTrades();
  trades.reverse().forEach(addTrade);
});

socket.on('trade', function(trade) {
  addTrade(trade);
});

socket.on('priceDistData', function(data) {
  rawPriceDistData = processPriceDistData(data);
  if (chartsReady) {
    drawPriceDistChart();
  }
});

google.setOnLoadCallback(function() {
  priceDistChart = new google
    .visualization
    .ColumnChart(document.getElementById('priceDistChart'));
  chartsReady = true;
  if (rawPriceDistData) drawPriceDistChart();
});

$tradeSizeFilter.change(function() {
  minTrade = $tradeSizeFilter.val();
  socket.emit('getTrades', minTrade);
});

var drawPriceDistChart = function() {
  priceDistData = google.visualization.arrayToDataTable(rawPriceDistData);
  priceDistChart.draw(priceDistData, priceDistOptions);
}

var processPriceDistData = function(data) {
  var exchanges = ['Exchanges'];
  var prices = [];
  var dataTable = []
  data.forEach(function(el) {
    if (!_.contains(exchanges, el.exchange)) {
      exchanges.push(el.exchange);
    }
    if (!_.contains(prices, el.price)) {
      prices.push(el.price);
    }
  });
  exchanges.push({role: 'annotation'});
  dataTable.push(exchanges);
  prices.forEach(function(price) {
    var row = [price];
    for (var i = 1; i < exchanges.length - 1; i++) {
      row.push(0);
    }
    row.push('');
    dataTable.push(row);
  });

  data.forEach(function(el) {
    var x = exchanges.indexOf(el.exchange);
    var y = prices.indexOf(el.price) + 1;
    dataTable[y][x] = Number(el.volume.toFixed(2));
  });
  return dataTable;

}