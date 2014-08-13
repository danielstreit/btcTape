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

module.exports = mongo;