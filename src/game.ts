import { Player } from './player'
import { Message, EVENT_TYPE, SENDER_TYPE } from './message'

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
    private players: { [playerId: number]: Player } = {}
    private state: GAME_STATE = GAME_STATE.WAITING_FOR_PLAYERS

    constructor(readonly gameId: number, players: Player[]) {
        players.forEach(player => {
            this.players[player.id] = player;
        });
    }

    public onMessage(message: Message) {
        if (message.gameId !== this.gameId) {
            console.log("ERR: GameId does not match! Got: " + message.gameId + "expected: !" + this.gameId)
            return;
        }

        switch (message.senderType) {
            case SENDER_TYPE.CONTROLLER:
                this.onControllerMessage(message)
                break;
            case SENDER_TYPE.VIEW:
                this.onViewMessage(message)
                break;
            default:
                console.log("ERR: Unknown SENDER_TYPE (" + message.senderType + ")!")
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
        let all_ready = true
        for (let playerId in this.players) {
            let player = this.players[playerId]
            if (!player.controllerConnected || !player.viewConnected) {
                all_ready = false;
                break;
            }
        }

        if (all_ready) {
            for (let playerId in this.players) {
                let message = this.prepareMessage();
                message.playerId = Number(playerId);
                message.eventType = EVENT_TYPE.GAME_STARTUP;
                this.writeMessage(message)
            }

            this.state = GAME_STATE.RUNNING;
        }
    }

    private running() {

    }

    private end() {

    }

    private prepareMessage(): Message {
        let message = new Message();
        message.gameId = this.gameId;
        message.senderType = SENDER_TYPE.GAME;        
        return message;
    }

    private onControllerMessage(message: Message) {
        let player: Player
        try {
            player = this.players[message.playerId]
        } catch (e) {
            console.log("ERR: PlayerId(" + message.playerId + ") does not exist!");
        }

        switch (message.eventType) {
            case EVENT_TYPE.CLIENT_CONNECT:
                player.controllerConnected = true;
                break;
            case EVENT_TYPE.CLIENT_DISCONNECT:
                player.controllerConnected = false;
                break;
            case EVENT_TYPE.CLIENT_STARTUP_ACK:
                break;
            case EVENT_TYPE.CLIENT_CHANGE_DIRECTION:
                break;
            default:
        }
    }

    private onViewMessage(message: Message) {
        let player: Player
        try {
            player = this.players[message.playerId];
        } catch (e) {
            console.log("ERR: PlayerId(" + message.playerId + ") does not exist!");
        }

        switch (message.eventType) {
            case EVENT_TYPE.CLIENT_CONNECT:
                player.viewConnected = true;
                break;
            case EVENT_TYPE.CLIENT_DISCONNECT:
                player.viewConnected = false;
                break;
            case EVENT_TYPE.CLIENT_STARTUP_ACK:
                break;
            case EVENT_TYPE.CLIENT_CHANGE_DIRECTION:
                break;
            default:
        }
    }
}