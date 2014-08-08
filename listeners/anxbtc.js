/*
* This module periodically requests trade data from Bitfinex,
* standardizes the trade data, and emits a trade event.
*/
var exchange = 'anxbtc';
var request = require('request');
var EventEmitter = require('events').EventEmitter;
var lastTimestamp = Math.floor(Date.now());
var baseurl = 'https://anxpro.com/api/2/BTCUSD/money/trade/fetch?since=';
var period = 5000;
var url;
var anxbtc = new EventEmitter();

setInterval(function() {
	url = baseurl + lastTimestamp;
	request(url, function(err, res, body) {
		if (err) return err;
		var rawTrades = JSON.parse(body).data;
		for (var i = 0; i < rawTrades.length; i++) {
			if (rawTrades[i].tid >= lastTimestamp) {
				lastTimestamp = rawTrades[i].tid + 1;
			}
			var trade = {
				exchange: exchange,
				date: rawTrades[i].tid,
				price: rawTrades[i].price,
				priceCurrency: 'USD',
				amount: rawTrades[i].amount,
				exchangeTradeID: rawTrades[i].tid
			};
			anxbtc.emit('trade', trade);
		}
	});

}, period);
module.exports = anxbtc;