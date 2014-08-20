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

// Fetch trades greater than min (defaults to 0);
mongo.getTrades = function(min, callback) {
  min = min || 0;
  callback = callback || function() {};
  Trade.find()
      .where('amount').gt(min)
      .limit(20)
      .sort('-date')
      .exec(callback);
};

// Fetch high, low, volume, and number of trades (numTrades)
mongo.getSummaryData = function(timeframe, callback) {
  var since = new Date(Date.now() - timeframe);
  var pipe = [];

  // Select trades since given date
  pipe.push({ 
    $match : { date : { $gt : since } }
  });

  pipe.push({
    $group: {
      _id: null,
      high: { $max: "$price" },
      low: { $min: "$price" },
      pq: { $sum: { $multiply: ["$price", "$amount"] } },
      volume: { $sum: "$amount" },
      numTrades: { $sum: 1 },
      trades: { $push: { price: "$price", amount: "$amount" } }
    }
  });

  pipe.push({
    $project: {
      vwap: { $divide: [ "$pq", "$volume" ] },
      high: 1,
      low: 1,
      volume: 1,
      numTrades: 1,
      trades: 1
    }
  });

  pipe.push({ $unwind: "$trades" });

  pipe.push({
    $project: {
      high: 1,
      low: 1,
      vwap: 1,
      volume: 1,
      numTrades: 1,
      trades: 1,
      weightedSquaredError: {
        $multiply: [
          { $subtract: ["$trades.price", "$vwap"]},
          { $subtract: ["$trades.price", "$vwap"]},
          "$trades.amount"
        ]
      }
    }
  });

  pipe.push({
    $group: {
      _id: null,
      high: { $first: "$high" },
      low: { $first: "$low" },
      vwap: { $first: "$vwap" },
      volume: { $first: "$volume" },
      numTrades: { $first: "$numTrades" },
      sumSquares: { $sum: "$weightedSquaredError" }
    }
  });

  pipe.push({
    $project: {
      _id: 0,
      high: 1,
      low: 1,
      vwap: 1,
      volume: 1,
      numTrades: 1,
      variance: { $divide: ["$sumSquares", "$volume"]}
    }
  });
  Trade.aggregate(pipe).exec(callback);

}

// Fetch data to build price distribution chart
mongo.getPriceDist = function(timeframe, callback) {
  var since = new Date(Date.now() - timeframe);
  var pipe = [];

  // Select trades since given date
  pipe.push({ 
    $match : { date : { $gt : since } }
  });

  // Trades need to be put in buckets to make a historgram
  // This hard codes one dollar buckets (for now)
  // This does -> price = Math.floor(price)
  pipe.push({
    $project : { 
      amount : 1, 
      exchange : 1, 
      price : { $subtract : ["$price", { $mod : ["$price", 1] } ] } 
    } 
  });

  // Group by price and exchange and sum volume for each
  // unique exchange and price bucket
  // This will be the fundamental data point
  pipe.push({ 
    $group : { 
      _id : { exchange: "$exchange", price: "$price" }, 
      volume : { $sum : "$amount" } 
    }
  });

  // Flatten the _id object used to group the buckets
  pipe.push({ 
    $project : { 
      exchange : "$_id.exchange", 
      price: "$_id.price", 
      volume: 1, 
      _id: 0
    } 
  });

  // Sort by exchange, and then price
  // This makes it easier to enter into data structure
  // compatible with charting library
  pipe.push({ 
    $sort : { 
      exchange: 1, 
      price: 1 
    } 
  });
  Trade.aggregate(pipe).exec(callback);
};

module.exports = mongo;