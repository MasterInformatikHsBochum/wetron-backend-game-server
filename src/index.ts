import { Game } from './game';
import { Message } from './message'
import { Player } from './player';
import { Utils } from './utils'
import * as Collections from 'typescript-collections';
import * as WebSocket from 'ws'


// let ws = new WebSocket('ws:172.17.0.1:8080')
let ws = new WebSocket('ws:193.175.85.50:80')

// let wss = new WebSocket.Server({ port: 8080 })

console.log('wetron-backend-game-server start')

// Init Game
let playerList = new Collections.LinkedList< Player>();
playerList.add(new Player(1))
// playerList.add(new Player(2))
let game = new Game(1, playerList)

// Init Web Socket
game.writeMessage = (message) => {
    Utils.debug("ws send: " + message.toJson())
    ws.send(message.toJson());
}

ws.on('message', (message) => {
    Utils.debug("ws recv: " + message)    ;
    game.onMessage(Message.fromJson(JSON.parse(message.toString())));
});

ws.on('open', () => {
    Utils.debug("ws open");
    game.onConnect();
});

// init Main Timer
let timer: NodeJS.Timer
timer = setInterval(function () {
    game.onMainTimerTick();
}, 1000);

// wss.on('connection', (ws, req) => {
//     ws.on('message', (message) => {
//         game.onMessage(JSON.parse(message.toString()))
//     })
//     game.sendMessage = (message) => ws.send(message.toJson)
// });