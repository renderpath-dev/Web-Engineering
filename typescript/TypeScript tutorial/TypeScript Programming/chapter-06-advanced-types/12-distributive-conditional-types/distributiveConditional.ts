// Goal:
// Observe distributive conditional types over unions.

// Expected result:
// The compiler distributes over each union member.

export {};

type ToArray<ValueType> = ValueType extends unknown ? ValueType[] : never;

type StringOrNumberArray = ToArray<string | number>;

const firstList: StringOrNumberArray = ["a", "b"];
const secondList: StringOrNumberArray = [1, 2];

// @ts-expect-error: This is not string[] or number[].
const mixedList: StringOrNumberArray = ["a", 1];

console.log(firstList.length);
console.log(secondList.length);
console.log(mixedList.length);