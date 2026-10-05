// Goal:
// Bind a generic type parameter at each function call

// Expected result:
// Each call can infer a differenct type

export { };

function wrapValue<ValueType>(value: ValueType): {
    value: ValueType
} {
    return { value };
}

const wrappedText = wrapValue ("draft");
const wrappedCount = wrapValue(3);

console.log(wrappedText.value.toUpperCase());
console.log(wrappedCount.value.toFixed());