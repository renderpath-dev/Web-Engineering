// Goal:
// Use an interface when only a contract is needed

// Expected result:
// The compiler accepts any object with the required shape

export {};

interface Logger {
    log(messageText:string):void;
}

class ConsoleLogger implements Logger {
    log(messageText:string):void {
        console.log(messageText);
    }
}

const objectLogger: Logger = {
    log(messageText: string): void {
        console.log(`object: ${messageText}`);
    },
};

objectLogger.log("ready");
new ConsoleLogger().log("ready");