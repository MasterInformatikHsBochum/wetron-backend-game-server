import { Player } from './player'

enum MSG {
    CLIENT_CONNECT = 0,
    CLIENT_DISCONNECT = 1,
    CLIENT_STARTUP_ACK = 3,
    CLIENT_CHANGE_DIRECTION = 6,
    GAME_STARTUP = 2,
    GAME_START = 4,
    GAME_END = 5,
    GAME_POSITION = 7
};

export class Game {
    constructor(readonly gameId : number, readonly players : Player[]) {
        
    }
}