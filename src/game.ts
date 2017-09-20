import { Player } from './player'
import { Message, EVENT_TYPE } from './message'

// TODO
// sender:
// receiver
// - g: game
// - c1: controller player 1
// - v1: view player 1

enum GAME_STATE {
    WAITING_FOR_PLAYERS = 0,
    RUNNING = 1,
    END = 2
}

export class Game {
    public writeMessage: (message: Message) => void
    private state: GAME_STATE = GAME_STATE.WAITING_FOR_PLAYERS
    private viewHash: { [connectionId: number]: Player } = {}
    private controllerHash: { [connectionId: number]: Player } = {}

    constructor(readonly gameId: number, readonly playerList: Player[]) {
    }

    public onWsConnect() {
        console.log("onConnect")
        let message = new Message(this.gameId, 1, "g", EVENT_TYPE.CONNECT_REQUEST, null)
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
        switch (this.state) {
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
                console.log("ERR: Unknown GAME_STATE (" + this.state + ")!")
        }
    }

    private onViewConnectRequest(request: Message) {
        let value = {}
        let player = this.getPlayerById(request.playerId)
        console.log(player + " " + player.viewConnected)
        if (player != null && player.viewConnected == false) {
            player.viewConnected = true

            value["success"] = true

            let otherPlayerList: Number[] = new Array()
            for (let p of this.playerList) {
                if (p.id != request.playerId) {
                    otherPlayerList.push(p.id)
                }
            }
        } else {
            value["success"] = false
        }

        // send response
        let response = new Message(this.gameId, request.playerId, "g", EVENT_TYPE.VIEW_CONNECT_RESPONSE, value)
        this.writeMessage(response)
    }

    private onControllerConnectRequest(request: Message) {
        let player = this.getPlayerById(request.playerId)
        let value = {}
        if (player != null && player.controllerConnected == false) {
            player.controllerConnected = true
            value["success"] = true
        } else {
            value["success"] = false
        }

        let response = new Message(this.gameId, request.playerId, "g", EVENT_TYPE.CTRL_CONNECT_RESPONSE, value)
        this.writeMessage(response)
    }

    private getPlayerById(playerId: number) {
        for (let player of this.playerList) {
            if (player.id == playerId) {
                return player
            }
        }

        return null
    }

    private waitingForPlayers() {
        // let all_ready = true
        // for (let playerId in this.players) {
        //     let player = this.players[playerId]
        //     if (!player.controllerConnected || !player.viewConnected) {
        //         all_ready = false;
        //         break;
        //     }
        // }

        // if (all_ready) {
        //     for (let playerId in this.players) {
        //         let message = this.prepareMessage();
        //         message.playerId = Number(playerId);
        //         message.eventType = EVENT_TYPE.GAME_STARTUP;
        //         this.writeMessage(message)
        //     }

        //     this.state = GAME_STATE.RUNNING;
        // }
    }

    private running() {

    }

    private end() {

    }
}