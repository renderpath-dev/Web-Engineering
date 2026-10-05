// Goal:
// Verify strict argument checking for call, apply, bind.

// Expected result:
// The compiler rejects invalid call arguments

export {};

function parseQuantity(quantityText: string):number {
    return Number.parseInt(quantityText,10);
}

const validQuantity = parseQuantity.call(undefined,"10");

// @ts-expect-error: The argument must be a string.
const invalidQuantity = parseQuantity.call(undefined,false);

console.log(validQuantity);
console.log(invalidQuantity);