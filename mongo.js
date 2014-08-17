var mongoose = require('mongoose');
mongoose.connect(process.env.CUSTOMCONNSTR_MONGOHQ_URI);
var db = mongoose.connection;
var tradeSchema = new mongoose.Schema({
  exchange: String,
  date: Date,
  price: Number,
  amount: Number,
  exchangeTradeID: Number
});
var Trade = mongoose.model('Trade', tradeSchema);

db.on('error', function(error) {
  console.error('Mongoose encountered an error:', error);
});

db.once('open', function() {
  console.log('Mongoose successfully opened connection with MongoHQ');
});

var mongo = {};
mongo.saveTrade = function(trade) {
  var t = new Trade(trade);
  t.save(function(error, t) {
    if (error) console.error(error);
  });
};

mongo.getTrades = function(min, callback) {
  min = min || 0;
  callback = callback || function() {};
  Trade.find()
      .where('amount').gt(min)
      .limit(20)
      .sort('-date')
      .exec(callback);
};

mongo.getPriceDist = function(timeframe, callback) {
  var since = new Date(Date.now() - timeframe);
  var match = { $match : { date : { $gt : since }}};
  var project = { $project : { amount : 1, exchange : 1, price : { $subtract : ["$price", { $mod : ["$price", 1] } ] } } };
  var group = { $group : { _id : { exchange: "$exchange", price: "$price" }, volume : { $sum : "$amount" } }};
  var unwind = { $project : { exchange : "$_id.exchange", price: "$_id.price", volume: 1, _id: 0} };
  var sort = { $sort : { exchange: 1, price: 1 } }
  Trade.aggregate(match, project, group, unwind, sort).exec(callback);
};

module.exports = mongo;