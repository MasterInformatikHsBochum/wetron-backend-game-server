var lastMsg: string

export class Utils {
    static debug(message?: any, ...optionalParams: any[]) {
        Utils.log('DBG: ' + message)
    }

    static warning(message?: any, ...optionalParams: any[]) {
        Utils.log('WRN: ' + message)
    }

    static error(message?: any, ...optionalParams: any[]) {
        Utils.log('ERR: ' + message)
    }
    
    static log(message?: any, ...optionalParams: any[]) {
        // if (message != lastMsg) {
            console.log(message);
            lastMsg = message;
        // }
    }
}