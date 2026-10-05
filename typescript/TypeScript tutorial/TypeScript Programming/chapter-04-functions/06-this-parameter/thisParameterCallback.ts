// Goal:
// Declare the type of this in a callback function

// Expected result:
// The compiler accepts the function callback

export {};

type AdminRecord = {
    id: string;
    isAdmin:boolean;
};

function filterWithThis<T> (
    items:T[],
    predicate:(this:T, item:T) => boolean,
): T[] {
    return items.filter((item)=> {
        return predicate.call(item,item);
    });
}

const accounts: AdminRecord[] = [
    {id:"a",isAdmin:true},
    {id:"b",isAdmin:false},
];

const adminAccounts = filterWithThis(accounts,function(this:AdminRecord) {
    return this.isAdmin;
});

console.log(adminAccounts);