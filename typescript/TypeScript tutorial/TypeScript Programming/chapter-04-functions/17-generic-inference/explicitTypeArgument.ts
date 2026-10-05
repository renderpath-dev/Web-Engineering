// Goal:
// Specify a generic type argument when inference is narrow

// Expected result:
// The compiler accepts a union array result

export {};

function combineLists<ItemType>(firstList: ItemType[],secondList: ItemType[]) {
    return firstList.concat(secondList);
}

const mixedList = combineLists<string | number>([1,2],["three"]);

console.log(mixedList);