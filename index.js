WebSocket = require('ws'),
    ws = new WebSocket('ws:172.17.0.1:8080');

console.log('wetron-backend-game-server start')

ws.on('open', function () {
    console.log('connected')
    ws.send('message');
});

ws.on('message', function (message) {
    console.log('received: %s', message);
});
