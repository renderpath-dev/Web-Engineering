// Goal:
// Stop distributive behavior by wrapping both sides in tuples.

// Expected result:
// The compiler keeps the union as one whole type.

export {};

type ToArrayNonDistributive<ValueType> = [ValueType] extends [unknown]
    ? ValueType[]
    : never;

type MixedArray = ToArrayNonDistributive<string | number>;

const mixedArray: MixedArray = ["a", 1, 2, "b"];

console.log(mixedArray.length);
