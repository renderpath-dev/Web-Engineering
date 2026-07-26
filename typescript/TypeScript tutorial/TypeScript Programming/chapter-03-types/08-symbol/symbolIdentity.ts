// Goal:
// Compare two general symbol values at runtime.

// Expected result:
// Node prints false.

export {};

const firstKey: symbol = Symbol("cache");
const secondKey: symbol = Symbol("cache");

console.log(firstKey === secondKey);