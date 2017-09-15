import { Game } from './game';
import { Player } from './player';
import * as WebSocket from 'ws'
import { Message } from './message'

// let ws = new WebSocket('ws:172.17.0.1:8080')
let wss = new WebSocket.Server({ port: 8080 })

console.log('wetron-backend-game-server start')

let gameId = 1;

let players: Player[] = new Array();
players.push(new Player(1))
players.push(new Player(2))

let game = new Game(1, players)

let timer: NodeJS.Timer
timer = global.setInterval(game.onMainTimerTick, 1000);

wss.on('connection', (ws, req) => {
    ws.on('message', (message) => {
        let msg = {}
        msg["id"] = 1
        msg["msg"] = JSON.parse(message.toString())
        game.onMessage(Message.fromJson(JSON.parse(JSON.stringify(msg))))
    })
    game.writeMessage = (message) => ws.send(Message.toJson(message))
});

// ws.on('message', (message) => {
//     console.log('received: %s', message);
// });

// ws.on('open', () => {
//     console.log('connected')
//     ws.send('message');
// });