export enum EVENT_TYPE {
    CONNECT_REQUEST = 0,
    VIEW_CONNECT_RESPONSE = 1,
    CTRL_CONNECT_RESPONSE = 8,
    DISCONNECT = 9,       
    COUNTDOWN = 4, 
    POSITION = 7,
    CTRL_CHANGE_DIRECTION = 6,
    GAME_END = 5
};

// export enum SENDER_TYPE {
//     VIEW = "v",
//     CONTROLLER = "c",
//     GAME = "g"
// }

export class Message {
    constructor(public readonly gameId: number,
        public readonly playerId: number,
        public readonly senderType: string,
        public readonly eventType: EVENT_TYPE,
        public readonly value) {
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