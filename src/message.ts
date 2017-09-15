export enum EVENT_TYPE {
    VIEW_CONNECT_REQUEST = 3,
    VIEW_CONNECT_RESPONSE = 4,
    VIEW_GAME_START = 5,
    VIEW_GAME_POSITION = 6,
    VIEW_GAME_END = 7,
    CTRL_CONNECT_REQUEST = 8,
    CTRL_CONNECT_RESPONSE = 9,
    CTRL_GAME_START = 10,
    CTRL_CHANGE_DIRECTION = 11,
    CTRL_GAME_END = 12
};

export class Message {
    constructor(readonly connectionId: number,
        readonly gameId: number,
        readonly eventType: EVENT_TYPE,
        readonly value) {

        if (gameId === 0) {
            throw new RangeError("gameId can't be 0")
        }

        if (connectionId === 0) {
            throw new RangeError("connectionId can't be 0")
        }
    }

    public static fromJson(json: JSON): Message {
        let msg = json["msg"]
        let message = new Message(json["id"], msg["g"], msg["e"], msg["v"]);

        return message
    }

    public toJson(): string {
        let msg = {};
        msg["g"] = this.gameId;
        msg["e"] = this.eventType;
        msg["v"] = this.value;

        let json = {}
        json["id"] = this.connectionId
        json["msg"] = msg

        return JSON.stringify(json);
    }
}