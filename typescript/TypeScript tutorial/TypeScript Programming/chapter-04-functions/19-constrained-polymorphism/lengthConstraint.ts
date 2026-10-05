// Goal:
// Use a generic constraint to access a required property

// Expected result:
// The compiler accepts values with a length property and reject numbers

export {};

function chooseLonger<ValueType extends {length:number}> (
    firstValue: ValueType,
    secondValue: ValueType,
): ValueType {
    if (firstValue.length >= secondValue.length) {
        return firstValue;
    }
    return secondValue;
}

console.log(chooseLonger("short","longer"));
console.log(chooseLonger([1,2],[1,2,3]));

// @ts-expect-error: Numbers do not have a length property
console.log(chooseLonger(10,100));

