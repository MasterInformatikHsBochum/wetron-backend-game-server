var lastMsg: string

export class Utils {
    static enableLog = false;

    static debug(message?: any, ...optionalParams: any[]) {
        Utils.log('DBG: ' + message)
    }

    static warning(message?: any, ...optionalParams: any[]) {
        Utils.log('WRN: ' + message)
    }

    static error(message?: any, ...optionalParams: any[]) {
        Utils.log('ERR: ' + message)
    }

    private

    static log(message?: any, ...optionalParams: any[]) {
        if (Utils.enableLog) {
            console.log(message);
            lastMsg = message;
        }
    }
}