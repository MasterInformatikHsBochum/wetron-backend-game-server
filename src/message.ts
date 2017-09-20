export enum EVENT_TYPE {
    CONNECT_REQUEST = 0,
    VIEW_CONNECT_RESPONSE = 1,
    CTRL_CONNECT_RESPONSE = 8
};

// export enum SENDER_TYPE {
//     VIEW = "v",
//     CONTROLLER = "c",
//     GAME = "g"
// }

export class Message {
    constructor(readonly gameId: number,
        readonly playerId: number,
        readonly senderType: string,
        readonly eventType: EVENT_TYPE,
        readonly value) {

        if (gameId === 0) {
            throw new RangeError("gameId can't be 0")
        }

        if (playerId === 0) {
            throw new RangeError("playerId can't be 0")
        }
    }

    public static fromJson(json: JSON): Message {
        let message = new Message(json["g"], json["p"], json["t"], json["e"], json["v"]);

        return message
    }

    public toJson(): string {
        let json = {}
        json["g"] = this.gameId;
        json["p"] = this.playerId;
        json["t"] = this.senderType;
        json["e"] = this.eventType;
        json["v"] = this.value;

        return JSON.stringify(json);
    }
}