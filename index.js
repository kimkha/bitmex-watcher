const notifier = require('node-notifier');

var BitMEXClient = require('bitmex-realtime-api');
// See 'options' reference below
var client = new BitMEXClient({testnet: false});

// handle errors here. If no 'error' callback is attached. errors will crash the client.
client.on('error', console.error);
client.on('open', () => console.log('Connection opened.'));
client.on('close', () => console.log('Connection closed.'));
client.on('initialize', () => console.log('Client initialized, data is flowing.'));

let oldData = null;
let oldTime = null;

client.addStream('XBTUSD', 'instrument', function(data, symbol, tableName) {
  // console.log(`Got update for ${tableName}:${symbol}. Current state:\n${JSON.stringify(data)}...`);
  if (data && data.length > 0) {
    const newData = data[0];
    if (!oldData) {
      console.log(`Init data`);
      oldData = newData;
      oldTime = +new Date(oldData['timestamp']);
    } else {
      const newTime = +new Date(newData['timestamp']);
      const delta = newTime - oldTime;
      if (delta > 5000) {
        // In short time: 10 seconds

        const t = +new Date(oldData['timestamp']);
        const diff = (newData[ 'midPrice' ] - oldData[ 'midPrice' ]) / oldData[ 'midPrice' ];
        const log = diff < 0 ? console.warn : console.log;
        log(`Change: ${(diff * 100).toFixed(4)}% = (${newData[ 'midPrice' ]} - ${oldData[ 'midPrice' ]}) at ${newData['timestamp']}`);
        if (diff > 0.005 || diff < -0.005) {
          // Price change more than 5%

          if (newTime - t < 300000) { // 5 min
            notifier.notify({
              title: `Big change!`,
              message: `Diff: ${(diff * 100).toFixed(2)}%, new price: ${newData[ 'midPrice' ]}`
            });
          } else {
            notifier.notify({
              title: `Small change!`,
              message: `Diff: ${(diff * 100).toFixed(2)}%, new price: ${newData[ 'midPrice' ]}`
            });
          }
          oldData = newData;
        } else if (newTime - t > 1200000) {// 20 min
          // Too long to wait, just update price
          oldData = newData;
        }

        oldTime = newTime;
      }
    }
  }
});

/**
 * Sample data
 {
    "symbol": "XBTUSD",
    "rootSymbol": "XBT",
    "state": "Open",
    "typ": "FFWCSX",
    "listing": "2016-05-13T12:00:00.000Z",
    "front": "2016-05-13T12:00:00.000Z",
    "expiry": null,
    "settle": null,
    "relistInterval": null,
    "inverseLeg": "",
    "sellLeg": "",
    "buyLeg": "",
    "positionCurrency": "USD",
    "underlying": "XBT",
    "quoteCurrency": "USD",
    "underlyingSymbol": "XBT=",
    "reference": "BMEX",
    "referenceSymbol": ".BXBT",
    "calcInterval": null,
    "publishInterval": null,
    "publishTime": null,
    "maxOrderQty": 10000000,
    "maxPrice": 1000000,
    "lotSize": 1,
    "tickSize": 0.1,
    "multiplier": -100000000,
    "settlCurrency": "XBt",
    "underlyingToPositionMultiplier": null,
    "underlyingToSettleMultiplier": -100000000,
    "quoteToSettleMultiplier": null,
    "isQuanto": false,
    "isInverse": true,
    "initMargin": 0.01,
    "maintMargin": 0.005,
    "riskLimit": 20000000000,
    "riskStep": 10000000000,
    "limit": null,
    "capped": false,
    "taxed": true,
    "deleverage": true,
    "makerFee": -0.00025,
    "takerFee": 0.00075,
    "settlementFee": 0,
    "insuranceFee": 0,
    "fundingBaseSymbol": ".XBTBON8H",
    "fundingQuoteSymbol": ".USDBON8H",
    "fundingPremiumSymbol": ".XBTUSDPI8H",
    "fundingTimestamp": "2017-05-15T12:00:00.000Z",
    "fundingInterval": "2000-01-01T08:00:00.000Z",
    "fundingRate": 0.002919,
    "indicativeFundingRate": -0.000564,
    "rebalanceTimestamp": null,
    "rebalanceInterval": null,
    "openingTimestamp": "2017-05-15T08:00:00.000Z",
    "closingTimestamp": "2017-05-15T10:00:00.000Z",
    "sessionInterval": "2000-01-01T02:00:00.000Z",
    "prevClosePrice": 1788.6,
    "limitDownPrice": null,
    "limitUpPrice": null,
    "bankruptLimitDownPrice": null,
    "bankruptLimitUpPrice": null,
    "prevTotalVolume": 5062120408,
    "totalVolume": 5070072042,
    "volume": 7951634,
    "volume24h": 49542536,
    "prevTotalTurnover": 493491073134716,
    "totalTurnover": 493955957234305,
    "turnover": 464884099589,
    "turnover24h": 2804290815483,
    "prevPrice24h": 1811.8,
    "vwap": 1766.6908,
    "highPrice": 1824,
    "lowPrice": 1685.8,
    "lastPrice": 1708.9,
    "lastPriceProtected": 1708.9,
    "lastTickDirection": "MinusTick",
    "lastChangePcnt": -0.0568,
    "bidPrice": 1709,
    "midPrice": 1709.35,
    "askPrice": 1709.7,
    "impactBidPrice": 1708.4088,
    "impactMidPrice": 1709.35,
    "impactAskPrice": 1710.308,
    "hasLiquidity": true,
    "openInterest": 11495769,
    "openValue": 667996145052,
    "fairMethod": "FundingRate",
    "fairBasisRate": 3.196305,
    "fairBasis": 1.74,
    "fairPrice": 1720.92,
    "markMethod": "FairPrice",
    "markPrice": 1720.92,
    "indicativeTaxRate": 0,
    "indicativeSettlePrice": 1719.18,
    "settledPrice": null,
    "timestamp": "2017-05-15T09:14:26.588Z"
    }
 */