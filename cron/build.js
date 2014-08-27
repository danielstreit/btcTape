// This script will build out the computed values collection from
// the trades database.
var MongoClient = require('mongodb').MongoClient;

var pipe = [];
pipe.push({
  $group: {
    _id: { month: { $month: "$date" }, day: { $dayOfMonth: "$date" }, year: { $year: "$date" } },
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
    _id: 1,
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
    _id: 1,
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
    _id:  "$_id",
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
    _id: 1,
    high: 1,
    low: 1,
    range: { $divide: [
      { $subtract: ["$high", "$low"] },
      "$vwap"
    ]},
    vwap: 1,
    volume: 1,
    numTrades: 1,
    variance: { $divide: ["$sumSquares", "$volume"]}
  }
});

pipe.push({
  $sort: { _id: -1 }
});

pipe.push({
  $skip: 1
});

pipe.push({
  $sort: { _id: 1 }
});

pipe.push({
  $skip: 1
});

var options = {
  out: 'computedValues',
  allowDiskUse: true
};

module.exports.build = function() {

  console.log('Starting build at', Date())
  // Connect to the db
  MongoClient.connect(process.env.CUSTOMCONNSTR_MONGOHQ_URI, function(error, db) {
    if (error) console.error(error);
    console.log('successfully connected to db');

    var trades = db.collection('trades');

    trades.aggregate(pipe, options, function(error, results) {
      if (error) console.error(error);
      db.close();
    });

  });
}