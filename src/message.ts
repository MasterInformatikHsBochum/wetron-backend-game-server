export enum SENDER_TYPE {
    CONTROLLER = 1,
    VIEW = 2,
    GAME = 3
};

export enum EVENT_TYPE {
    CLIENT_CONNECT = 0,
    CLIENT_DISCONNECT = 1,
    CLIENT_STARTUP_ACK = 3,
    CLIENT_CHANGE_DIRECTION = 6,
    GAME_STARTUP = 2,
    GAME_START = 4,
    GAME_END = 5,
    GAME_POSITION = 7
};

export class Message {
    public gameId: number
    public eventType: EVENT_TYPE
    public playerId: number
    public senderType: SENDER_TYPE
    public value

    public static fromJson(json) {
        let message = new Message;

        if (json.g === 0) {
            throw new RangeError("gameId can't be 0")
        }

        if (json.p === 0) {
            throw new RangeError("playerId can't be 0")
        }

        // gameId
        message.gameId = json.g

        // eventType
        if (EVENT_TYPE[json.e]) {
            message.eventType = json.e
        }

        // playerId
        message.playerId = json.p

        // type
        switch (json.t) {
            case 'c':
                message.senderType = SENDER_TYPE.CONTROLLER
                break;
            case 'v':
                message.senderType = SENDER_TYPE.VIEW
                break;
            default:
        }
        message.senderType = json.t

        // value
        message.value = json.v
    }

    public static toJson(message: Message) {
        let json;
        json.g = message.gameId;
        json.e = message.eventType;
        json.p = message.playerId;
        json.t = message.playerId;
        json.v = message.value;

        return json;
    }
}