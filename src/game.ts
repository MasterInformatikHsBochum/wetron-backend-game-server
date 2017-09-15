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

    public onMessage(request: Message) {
        console.log(request.toJson())
        if (request.gameId !== this.gameId) {
            console.log("ERR: GameId does not match! Got: " + request.gameId + "expected: !" + this.gameId)
            return;
        }

        switch (request.eventType) {
            case EVENT_TYPE.VIEW_CONNECT_REQUEST:
                console.log(this.playerList[request.value["player-id"]]);
                if (this.viewHash[request.connectionId]) {
                    console.log("ERR: View already Connected! Id: " + request.connectionId);
                } else {
                    for (let player of this.playerList) {
                        let alreadyConnected = false
                        for(let connectionId in this.viewHash) {
                            if (this.viewHash[connectionId] == player) {
                                alreadyConnected = true;
                                break;
                            }
                        }
                        if (alreadyConnected == false) {
                            console.log("player connected! Id: " + request.connectionId);
                            this.viewHash[request.connectionId] = player;
                            let value = {}
                            value["p"] = 1
                            value["o"] = [2]
                            let response = new Message(request.connectionId, this.gameId, EVENT_TYPE.CTRL_CONNECT_RESPONSE, value)
                            this.writeMessage(response)
                            break;
                        }
                    }
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