import { Player } from './player'
import { Message, EVENT_TYPE } from './message'
import * as Collections from 'typescript-collections';
import { Utils } from './utils'

// TODO
// sender:
// receiver
// - g: game
// - c1: controller player 1
// - v1: view player 1

// production target als npm

export enum GAME_STATE {
    WAITING_FOR_PLAYERS,
    COUNTDOWN,
    RUNNING,
    END
}

export class Game {
    public writeMessage: (message: Message) => void;
    private _playerDict = new Collections.Dictionary<number, Player>();
    private _state = GAME_STATE.WAITING_FOR_PLAYERS;
    private _countDownTimer: NodeJS.Timer;
    private _countDownTimeLeft = 0;

    constructor(
        readonly gameId: number,
        playerList: Collections.LinkedList<Player>
    ) {

        // add players to dictionary
        playerList.forEach(player => {
            this._playerDict.setValue(player.id, player);
        });
    }

    public onConnect() {
        let message = new Message(this.gameId, null, "g", EVENT_TYPE.CONNECT_REQUEST, null)
        this.writeMessage(message)
    }

    public onMessage(request: Message) {
        if (request.gameId !== this.gameId) {
            Utils.error("GameId does not match! Got: " + request.gameId + "expected: !" + this.gameId)
            return;
        }

        switch (request.eventType) {
            case EVENT_TYPE.CONNECT_REQUEST:
                if (request.senderType == "v") {
                    this.onViewConnectRequest(request);
                } else if (request.senderType == "c") {
                    this.onControllerConnectRequest(request)
                } else {
                    Utils.error("Unknown senderType: " + request.senderType)
                }
                break;
            case EVENT_TYPE.DISCONNECT:
                if (request.senderType == "v") {
                    let player = this._playerDict.getValue(request.playerId);
                    if (player) {
                        player.viewConnected = false;
                    }
                } else if (request.senderType == "c") {
                    let player = this._playerDict.getValue(request.playerId);
                    if (player) {
                        player.controllerConnected = false;
                    }
                } else {
                    Utils.error("Unknown senderType: " + request.senderType)
                }
                break;
            default:
        }
    }

    public onMainTimerTick() {
        switch (this._state) {
            case GAME_STATE.WAITING_FOR_PLAYERS:
                // Wait until every Controller and View is Connected
                this.waitingForPlayersState();
                break;
            case GAME_STATE.COUNTDOWN:
                // Countdowntimer runs -> 3.. 2.. 1.. GO
                break;
            case GAME_STATE.RUNNING:
                // Game is running
                this.runningState();
                break;
            case GAME_STATE.END:
                // game ends when only one player is alive
                this.endState();
                break;
            default:
                Utils.error("Unknown GAME_STATE: " + this._state);
        }
    }

    private onViewConnectRequest(request: Message) {
        let value = {}
        let player = this._playerDict.getValue(request.playerId)

        if (player && player.viewConnected == false) {
            player.viewConnected = true

            value["success"] = true

            let otherPlayerList: Number[] = new Array();
            for (let playerId of this._playerDict.keys()) {
                if (playerId != request.playerId) {
                    otherPlayerList.push(playerId)
                }
            }

            value["o"] = otherPlayerList
        } else {
            value["success"] = false;
        }

        // send response
        let response = new Message(this.gameId, request.playerId, "g", EVENT_TYPE.VIEW_CONNECT_RESPONSE, value);
        this.writeMessage(response);
    }

    private onControllerConnectRequest(request: Message) {
        let player = this._playerDict.getValue(request.playerId);
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

    private waitingForPlayersState() {
        let all_ready = true;
        for (let playerId of this._playerDict.keys()) {
            let player = this._playerDict.getValue(playerId);
            if (!player.controllerConnected || !player.viewConnected) {
                all_ready = false;
            }
        }

        if (!all_ready) {
            // print progress in single line
            Utils.debug("waiting for players: " + JSON.stringify(this.playerList));
        } else {
            // send positions of all players to each player
            this.sendAllPositions();
            this.startCountDown();
            this._state = GAME_STATE.COUNTDOWN;
        }
    }

    private startCountDown() {
        this._countDownTimeLeft = 4000;
        const that = this;
        this._countDownTimer = setInterval(function () {
            that.onCountDownTimerTick();
        }, 1000);
    }

    private onCountDownTimerTick() {
        // send countdown-to all players (3.. 2.. 1.. GO)
        for (let playerId of this._playerDict.keys()) {
            let value = {};
            value["countdown-ms"] = this._countDownTimeLeft - 1000;
            let message = new Message(this.gameId, playerId, "g", EVENT_TYPE.COUNTDOWN, value);
            this.writeMessage(message);
        }
        this._countDownTimeLeft -= 1000;
        
        // check if countdown is 0
        if (this._countDownTimeLeft == 0) {
            clearInterval(this._countDownTimer);
            this._state = GAME_STATE.RUNNING;
        }
    }

    private runningState() {
        
    }

    private endState() {

    }

    private sendAllPositions() {
        let positionList = new Collections.LinkedList();
        for (let player of this._playerDict.values()) {
            positionList.add({ "p": player.id, "x": 0, "y": 0, "d": 0.0 });
        }

        for (let player of this._playerDict.values()) {
            let message = new Message(this.gameId, player.id, "g", EVENT_TYPE.POSITION, positionList.toArray());
            this.writeMessage(message);
        }
    }

    get playerList(): Player[] {
        return this._playerDict.values();
    }

    get state(): GAME_STATE {
        return this._state;
    }
}