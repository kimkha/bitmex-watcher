var BitMEXClient = require('bitmex-realtime-api');
// See 'options' reference below
var client = new BitMEXClient({testnet: false});

// handle errors here. If no 'error' callback is attached. errors will crash the client.
client.on('error', console.error);
client.on('open', () => console.log('Connection opened.'));
client.on('close', () => console.log('Connection closeed.'));
client.on('initialize', () => console.log('Client initialized, data is flowing.'));

client.addStream('XBTUSD', 'instrument', function(data, symbol, tableName) {
  console.log(`Got update for ${tableName}:${symbol}. Current state:\n${JSON.stringify(data)}...`);
  // Do something with the table data...
});
