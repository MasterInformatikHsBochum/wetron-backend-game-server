import { Game } from './game';
import { Player } from './player';
import * as WebSocket from 'ws'

let ws = new WebSocket('ws:172.17.0.1:8080')

console.log('wetron-backend-game-server start')

let gameId = 1;

let players: Player[] = new Array();
players.push(new Player(1))
players.push(new Player(2))

let game = new Game(1, players)

let timer: NodeJS.Timer
timer = global.setInterval(game.onMainTimerTick, 1000);

ws.on('open', function () {
    console.log('connected')
    ws.send('message');
});

ws.on('message', function (message) {
    console.log('received: %s', message);
});