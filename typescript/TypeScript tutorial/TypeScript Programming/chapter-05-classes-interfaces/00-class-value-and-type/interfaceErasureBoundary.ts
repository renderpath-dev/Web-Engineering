// Goal:
// Verify that interface is erased but class remains as a runtime value

// Expected result
// The compiler accepts this file and Node prints values

export {};

interface SerializableRecord {
    serialize():string;
}

class UserRecord implements SerializableRecord {
    constructor (public id: string) {}

    serialize(): string {
        return JSON.stringify({id: this.id});
    }
}

const userRecord = new UserRecord("u1");

console.log(typeof UserRecord);
console.log(userRecord.serialize())