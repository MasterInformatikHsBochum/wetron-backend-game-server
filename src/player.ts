export enum PLAYER_DIRECTION {
    UP = 0,
    RIGHT = 90,
    DOWN = 180,
    LEFT = 270
}

export enum PLAYER_STATE {
    PLAYING,
    DEAD,
    LOSE,
    WIN
}

export class Player {
    public controllerConnected = false
    public viewConnected = false
    public currentDirection = 0
    public nextDirection = 0
    public x = 0
    public y = 0
    public state = PLAYER_STATE.PLAYING;

    constructor(readonly id: number) {

    }
}