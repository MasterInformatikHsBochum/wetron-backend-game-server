export enum PLAYER_DIRECTION {
    LEFT = 0.75,
    RIGHT = 0.25
}

export class Player {
    public controllerConnected = false
    public viewConnected = false
    public nextDirection = 0
    public x = 0
    public y = 0

    constructor(readonly id: number) {

    }
}