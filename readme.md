When I first started this project, the objective was to see if I could get real time data from various sources into my app and do something interesting with it. Now that it does that, I've shown a few people, and the reaction is always "so what?" I guess the data as it was displayed was only interesting to me. But, in explaining what it is, I have come to a better idea of what it should be. It should be a broad market monitor, giving the user an instant snapshot of what is happening in the bitcoin markets and sending notifications when something dramatic happens. Afterall, who wants to sit and watch a stream of numbers flow on the screen in front of them? (Except maybe me). Most people only care when something interesting happens.

How about a rebranding? I think the ticker tape should not the centerpiece. Should it be there at all? The crux of the app is market monitoring. I have my eye on MarketMon.io. 

What should it monitor and trigger notifications on?

Volatility
This could be a useful metric for bussinesses that need to convert currency frequently. For example, if volatility is high, a merchant might increase its spread for accepting bitcoin because of the increased uncertainty of the the dollar value of those bitcoin in the open market.
Notifications could be triggered at a certain threshold or a certain percentile (say if volatility is in the 95th percentile of volatility observations, send a notification).

Volume
Increases in volume often presage big price movements and the volume generally continues to increase through the price movement. An alert when volume spikes could be useful to investors and merchants who depend upon the price of bitcoin.

VWAP
Volume weighted average price. This is a better measure than a simple average because it takes into account volume (small outliers will have little impact on the average). Should this be a notification? Under what conditions should this trigger a notification?

New highs/lows
Over a period (maybe 24 hours), if the price hits a high or low, send a notification. This could be indicative of a trend or a significant movement. If the price remains within its 24 hour range, that would be an indication of price stability. Maybe the display would be one of three states: made new high in last 24hours, made new low in last 24hours, or range bound.

How notifications could be made
Email, twitter, socket.io api, and/or http api

Market Snapshot Dashboard - current state of the markets
  what should this show?

  Display the state of the various notification metrics above.

  The transaction tape - is this useful or interesting? should it be dropped completely or maybe relegated to a sub page?

  Charts!
    Price Distribution color coded by market (current chart)
    stock style charts with daily high, low, vwap
    other ideas?