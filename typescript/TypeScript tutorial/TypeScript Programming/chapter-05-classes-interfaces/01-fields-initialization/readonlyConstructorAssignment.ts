// Goal:
// Verify that readonly fields can be assigned in the constructor but nit later

// Expected result:
// The compiler rejects reassignment outside the constructor

export {};

class SessionRecord {
    readonly sessionId: string;

    constructor(sessionId:string) {
        this.sessionId = sessionId;
    }

    changeSessionId(nextSessionId: string):void {
        // @ts-expect-error: A readonly field cannot be reassigned here
        this.sessionId = nextSessionId;
    }
}

const sessionRecord = new SessionRecord("s1")

console.log(sessionRecord.sessionId);