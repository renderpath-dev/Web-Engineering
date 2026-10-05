// Goal:
// Avoid using arrow functions when an API controls this

// Expected result:
// The compiler rejects using this from the wrong scope

export {};

type UserRecord = {
    id: string;
    isAdmin:boolean;
};

type UserFilter = (this:UserRecord) => boolean;

function runUserFilter(userRecord: UserRecord, filterUser: UserFilter): boolean {
    return filterUser.call(userRecord);
}

// The error is inside the arrow function body below.
runUserFilter({id:"a",isAdmin:true},()=> {
    //@ts-expect-error: Arrow functions do not have their own this parameter.
    return this.isAdmin;
})