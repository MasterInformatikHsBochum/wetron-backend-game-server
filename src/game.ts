import { Player } from './player'
import { Message, EVENT_TYPE } from './message'
import * as Collections from 'typescript-collections';
var progress = require('single-line-log').stdout;

// TODO
// sender:
// receiver
// - g: game
// - c1: controller player 1
// - v1: view player 1

// typescript fehlt
// production target als npm

export enum GAME_STATE {
    WAITING_FOR_PLAYERS = 1,
    RUNNING = 2,
    END = 3
}

export class Game {
    public writeMessage: (message: Message) => void;
    private m_playerDict = new Collections.Dictionary<number, Player>();
    private m_state = GAME_STATE.WAITING_FOR_PLAYERS

    constructor(
        readonly gameId: number,
        playerList: Collections.LinkedList<Player>
    ) {

        // add players to dictionary
        playerList.forEach(player => {
            this.m_playerDict.setValue(player.id, player);
        });
    }

    public onConnect() {
        console.log("onConnect")
        let message = new Message(this.gameId, null, "g", EVENT_TYPE.CONNECT_REQUEST, null)
        this.writeMessage(message)
    }

    public onMessage(request: Message) {
        console.log(request.toJson())
        if (request.gameId !== this.gameId) {
            console.log("ERR: GameId does not match! Got: " + request.gameId + "expected: !" + this.gameId)
            return;
        }

        switch (request.eventType) {
            case EVENT_TYPE.CONNECT_REQUEST:
                if (request.senderType == "v") {
                    this.onViewConnectRequest(request);
                } else if (request.senderType == "c") {
                    this.onControllerConnectRequest(request)
                } else {
                    console.log("ERR: unknown senderType: " + request.senderType)
                }
                break;
            default:
        }
    }

    public onMainTimerTick() {
        switch (this.m_state) {
            case GAME_STATE.WAITING_FOR_PLAYERS:
                this.waitingForPlayers();
                break;
            case GAME_STATE.RUNNING:
                this.running();
                break;
            case GAME_STATE.END:
                this.end();
                break;
            default:
                console.log("ERR: Unknown GAME_STATE:", this.m_state);
        }
    }

    private onViewConnectRequest(request: Message) {
        let value = {}
        let player = this.m_playerDict.getValue(request.playerId)
        console.log(player + " " + player.viewConnected)
        if (player && player.viewConnected == false) {
            player.viewConnected = true

            value["success"] = true

            let otherPlayerList: Number[] = new Array()
            for (let playerId of this.m_playerDict.keys()) {
                if (playerId != request.playerId) {
                    otherPlayerList.push(playerId)
                }
            }
        } else {
            value["success"] = false;
        }

        // send response
        let response = new Message(this.gameId, request.playerId, "g", EVENT_TYPE.VIEW_CONNECT_RESPONSE, value);
        this.writeMessage(response);
    }

    private onControllerConnectRequest(request: Message) {
        let player = this.m_playerDict.getValue(request.playerId);
        let value = {};
        if (player && player.controllerConnected == false) {
            player.controllerConnected = true;
            value["success"] = true;
        } else {
            value["success"] = false;
        }

        let response = new Message(this.gameId, request.playerId, "g", EVENT_TYPE.CTRL_CONNECT_RESPONSE, value);
        this.writeMessage(response);
    }

    private waitingForPlayers() {
        let all_ready = true;
        for (let playerId of this.m_playerDict.keys()) {
            let player = this.m_playerDict.getValue(playerId);
            if (!player.controllerConnected || !player.viewConnected) {
                all_ready = false;
            }
        }

        if (!all_ready) { 
            // print progress in single line
            progress("waiting for players: " + JSON.stringify(this.playerList));
        } else {
            progress.clear(); // enables new lines again
            for (let playerId of this.m_playerDict.keys()) {
                let value = {};
                value["countdown-ms"] = 3000;
                let message = new Message(this.gameId, playerId, "g", EVENT_TYPE.GAME_STARTUP, value);
                this.writeMessage(message);
            }

            this.m_state = GAME_STATE.RUNNING;
        }
    }

    private running() {

    }

    private end() {

    }

    get playerList(): Player[] {
        return this.m_playerDict.values();
    }

    get state() {
        return this.m_state;
    }
}