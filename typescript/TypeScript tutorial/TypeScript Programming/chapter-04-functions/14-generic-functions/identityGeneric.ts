// Goal:
// Preserve input type through a generic function

// Expected result:
// The compiler infers different return types for different calls

export {}

function identityValue<ValueType>(value: ValueType): {value: ValueType} {
    return {value};
}

const titleText = identityValue("keyboard");
const quantityValue = identityValue(12);

console.log(titleText.value.toUpperCase());
console.log(quantityValue.value.toFixed());