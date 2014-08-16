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

module.exports = mongo;