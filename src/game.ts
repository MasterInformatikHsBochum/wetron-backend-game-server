import { Grid } from './grid';
import { Message, EVENT_TYPE } from './message';
import { PLAYER_DIRECTION, Player, PLAYER_STATE } from './player';;
import { Utils } from './utils';
import * as fs from 'fs';
import * as Collections from 'typescript-collections';

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
    private _grid: Grid;

    constructor(
        readonly gameId: number,
        playerList: Collections.LinkedList<Player>
    ) {
        // add players to dictionary
        playerList.forEach(player => {
            this._playerDict.setValue(player.id, player);
        });

        // calculate size of grid depending on players and fps
        let maxPlayerPerSide = (Math.floor(this._playerDict.size() / 4))
        if ((this._playerDict.size() % 4) != 0) {
            maxPlayerPerSide += 1;
        }
        // set base width
        let width = 800;
        if (maxPlayerPerSide > 1) {
            // add width based on max-player per side
            width += (maxPlayerPerSide - 1) * 200;
        }
        this._grid = new Grid(width, width);
        Utils.debug('grid(w: ' + this._grid.width + ' h: ' + this._grid.height);

        // calc player start positions
        this.calcPlayerStartPositions();

        // write game-status to file for rest-api
        this.writeGameStatusToFile();
    }

    private calcPlayerStartPositions() {
        // calculate inner rectangle / starting line
        let x_offset = Math.floor(0.1 * this._grid.width);
        let inner_width = Math.floor(this._grid.width * 0.8);
        let y_offset = Math.floor(0.1 * this._grid.height);
        let inner_height = Math.floor(0.8 * this._grid.height);

        // calc players per side
        let count = this._playerDict.size();
        let east_count = Math.floor(count / 4);
        count -= east_count;
        let west_count = Math.floor(count / 3);
        count -= west_count;
        let south_count = Math.floor(count / 2);
        count -= south_count;
        let north_count = Math.floor(count);

        for (let player of this._playerDict.values()) {
            // set coordinates of players + view direction
            if (player.id % 4 == 0) {
                // EAST
                player.currentDirection = PLAYER_DIRECTION.LEFT;
                player.x = x_offset + inner_width;
                player.y = y_offset + (player.id / 4) * Math.floor(inner_height / (east_count + 1));
            } else if (player.id % 3 == 0) {
                // WEST
                player.currentDirection = PLAYER_DIRECTION.RIGHT;
                player.x = x_offset;
                player.y = y_offset + ((player.id + 1) / 4) * Math.floor(inner_height / (west_count + 1));
            } else if (player.id % 2 == 0) {
                // SOUTH
                player.currentDirection = PLAYER_DIRECTION.UP;
                player.x = x_offset + ((player.id + 2) / 4) * Math.floor(inner_height / (south_count + 1));
                player.y = y_offset;
            } else {
                // NORTH
                player.currentDirection = PLAYER_DIRECTION.DOWN;
                player.x = x_offset + ((player.id + 3) / 4) * Math.floor(inner_height / (north_count + 1));
                player.y = y_offset + inner_height;
            }

            Utils.debug('player(id: ' + player.id + ' x: ' + player.x + ' y: ' + player.y + ' d: ' + player.currentDirection + ')');
            
        }
    }

    public onConnect() {
        let message = new Message(this.gameId, null, "g", EVENT_TYPE.CONNECT_REQUEST, null)
        this.writeMessage(message)

        // for(let player of this._playerDict.values()) {
        //     player.controllerConnected = true;
        //     player.viewConnected = true;
        // }
    }

    public onMessage(message: Message) {
        if (message.gameId !== this.gameId) {
            Utils.error("GameId does not match! Got: " + message.gameId + "expected: !" + this.gameId)
            return;
        }

        switch (message.eventType) {
            case EVENT_TYPE.CONNECT_REQUEST:
                if (message.senderType == "v") {
                    this.onViewConnectRequest(message);
                } else if (message.senderType == "c") {
                    this.onControllerConnectRequest(message)
                } else {
                    Utils.error("Unknown senderType: " + message.senderType)
                }
                break;
            case EVENT_TYPE.DISCONNECT:
                if (message.senderType == "v") {
                    let player = this._playerDict.getValue(message.playerId);
                    if (player) {
                        player.viewConnected = false;
                        this.writeGameStatusToFile();
                    }
                } else if (message.senderType == "c") {
                    let player = this._playerDict.getValue(message.playerId);
                    if (player) {
                        player.controllerConnected = false;
                    }
                } else {
                    Utils.error("Unknown senderType: " + message.senderType)
                }
                break;
            case EVENT_TYPE.CTRL_CHANGE_DIRECTION:
                let player = this._playerDict.getValue(message.playerId);
                player.nextDirection = message.value['d'];
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

    private writeGameStatusToFile() {
        const filename = '/tmp/game-status.json';
        let playerList = [];
        for (let player of this._playerDict.values()) {
            if (player.viewConnected) {
                playerList.push({
                    'id': player.id
                });
            }
        }
        let data = {
            'id': this.gameId,
            'maxPlayers': this._playerDict.size(),
            'players': playerList
        }
        fs.writeFile(filename, JSON.stringify(data), (err) => {
            if (err) {
                Utils.error("Could not write file: " + filename);
            }
        });
    }

    private onViewConnectRequest(request: Message) {
        let value = {}
        let player = this._playerDict.getValue(request.playerId)

        if (player && player.viewConnected == false) {
            player.viewConnected = true;
            this.writeGameStatusToFile();

            value['success'] = true;

            let otherPlayerList: Number[] = new Array();
            for (let playerId of this._playerDict.keys()) {
                if (playerId != request.playerId) {
                    otherPlayerList.push(playerId)
                }
            }
            value['o'] = otherPlayerList;

            value['grid'] = { 'w': this._grid.width, 'h': this._grid.height };
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
        this._countDownTimer = setInterval(() => {
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
        for (let player of this._playerDict.values()) {
            if (player.state == PLAYER_STATE.PLAYING) {
                player.currentDirection = (player.currentDirection + player.nextDirection) % 360;
                player.nextDirection = PLAYER_DIRECTION.UP;

                switch (player.currentDirection) {
                    case PLAYER_DIRECTION.UP:
                        player.y += 1;
                        break;
                    case PLAYER_DIRECTION.RIGHT:
                        player.x += 1;
                        break;
                    case PLAYER_DIRECTION.DOWN:
                        player.y -= 1;
                        break;
                    case PLAYER_DIRECTION.LEFT:
                        player.x -= 1;
                        break;
                    default:
                        Utils.error("Unknown state!!!");
                }

                if (!this._grid.pushPlayerToCoordinates(player.id, player.x, player.y)) {
                    Utils.debug("Player died [" + player.id + "]");
                    player.state = PLAYER_STATE.DEAD;
                }
            }
        }

        // notify views with new player positions
        let value = []
        let playerAliveCount = 0;
        for (let player of this._playerDict.values()) {
            if (player.state == PLAYER_STATE.PLAYING) {
                value.push({ 'p': player.id, 'x': player.x, 'y': player.y, 'd': player.currentDirection });

                playerAliveCount++;
            }
        }

        if (playerAliveCount > 1) {
            this.sendAllPositions();
        }

        for (let player of this._playerDict.values()) {
            if (player.state == PLAYER_STATE.DEAD) {
                player.state = PLAYER_STATE.LOSE;
                this.sendEndMessage(player);
            }

            if (playerAliveCount == 1) {
                if (player.state == PLAYER_STATE.PLAYING) {
                    player.state = PLAYER_STATE.WIN;
                    this.sendEndMessage(player);
                }
            }
        }

        if (playerAliveCount == 0) {
            this._state = GAME_STATE.END;
            Utils.debug("END");
        }
    }

    private sendEndMessage(player: Player) {
        let value = {}
        value['win'] = (player.state == PLAYER_STATE.WIN)
        let message = new Message(this.gameId, player.id, 'g', EVENT_TYPE.GAME_END, value);
        this.writeMessage(message);
    }

    private endState() {
        process.exit();
    }

    private sendAllPositions() {
        let value = []
        for (let player of this._playerDict.values()) {
            if (player.state == PLAYER_STATE.PLAYING) {
                value.push({ 'p': player.id, 'x': player.x, 'y': player.y, 'd': player.currentDirection });
            }
        }

        if (value.length > 0) {
            for (let player of this._playerDict.values()) {
                let message = new Message(this.gameId, player.id, "g", EVENT_TYPE.POSITION, value);
                this.writeMessage(message);
            }
        }
    }

    get playerList(): Player[] {
        return this._playerDict.values();
    }

    get state(): GAME_STATE {
        return this._state;
    }
}