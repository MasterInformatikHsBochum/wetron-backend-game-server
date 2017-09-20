import { Game } from './game';
import { Player } from './player';
import * as WebSocket from 'ws'
import { Message } from './message'

// let ws = new WebSocket('ws:172.17.0.1:8080')
let ws = new WebSocket('ws:193.175.85.50:80')
// let wss = new WebSocket.Server({ port: 8080 })

console.log('wetron-backend-game-server start')

// Init Game
let players: Player[] = new Array();
players.push(new Player(1))
players.push(new Player(2))
let game = new Game(1, players)

// Init Web Socket
game.writeMessage = (message) => {
    console.log(message.toJson())
    ws.send(message.toJson());
}

ws.on('message', (message) => {
    game.onMessage(Message.fromJson(JSON.parse(message.toString())))
    console.log("ws: message received: %s", message)
});

ws.on('open', () => {
    console.log("ws: open")
    console.log(game)
    game.onWsConnect()
});

// init Main Timer
let timer: NodeJS.Timer
timer = global.setInterval(game.onMainTimerTick, 1000);

// wss.on('connection', (ws, req) => {
//     ws.on('message', (message) => {
//         game.onMessage(JSON.parse(message.toString()))
//     })
//     game.writeMessage = (message) => ws.send(message.toJson)
// });