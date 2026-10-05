// Goal:
// Declare a generic parameter on a call signature

// Expected result:
// The compiler accepts calls with differenct types.

export {};

type ValueWrapper = {
    <ValueType>(value: ValueType): {value: ValueType};
};

const wrapValue: ValueWrapper = (value) => {
    return {value};
};

console.log(wrapValue("hello").value.toUpperCase());
console.log(wrapValue(42).value.toFixed());

