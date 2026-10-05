// Goal:
// Use InstanceType to get the instance type from a constructor type

// Expected result:
// The compiler accepts this file

export {};

class UserRecord {
    constructor(public readonly id: string){}
}

type UserInstance = InstanceType<typeof UserRecord>;

const userRecord: UserInstance = new  UserRecord("u1");

console.log(userRecord.id);