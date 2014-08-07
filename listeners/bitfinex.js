/*
* This module periodically requests trade data from Bitfinex,
* standardizes the trade data, and sends a trade object to the callback function.
*/
var exchange = 'Bitfinex';
var request = require('request');
var EventEmitter = require('events').EventEmitter;
var lastTimestamp = Math.floor(Date.now()/1000);
var baseurl = 'https://api.bitfinex.com/v1/trades/btcusd?timestamp=';
var period = 5000;
var url;
var bitfinex = new EventEmitter();

setInterval(function() {
	url = baseurl + lastTimestamp;
	request(url, function(err, res, body) {
		if (err) return err;
		var rawTrades = JSON.parse(body).reverse();
		for (var i = 0; i < rawTrades.length; i++) {
			if (rawTrades[i].timestamp >= lastTimestamp) {
				lastTimestamp = rawTrades[i].timestamp + 1;
			}
			var trade = {
				exchange: exchange,
				date: rawTrades[i].timestamp * 1000,
				price: parseFloat(rawTrades[i].price),
				priceCurrency: 'USD',
				amount: parseFloat(rawTrades[i].amount),
				exchangeTradeID: rawTrades[i].tid
			};
			bitfinex.emit('trade', trade);
		}
	});

}, period);

module.exports = bitfinex;