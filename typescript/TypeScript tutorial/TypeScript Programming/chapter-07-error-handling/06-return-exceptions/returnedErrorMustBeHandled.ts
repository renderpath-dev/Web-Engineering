// Goal:
// Show why returned Error values must be checked.

// Expected result:
// The compiler rejects treating number | Error as number.

export {};

function parseQuantity(inputText: string): number | Error {
    const parsedValue = Number(inputText);

    if (!Number.isInteger(parsedValue)) {
        return new TypeError("Quantity must be an integer");
    }

    return parsedValue;
}

const quantity = parseQuantity("x");

// @ts-expect-error: quantity may be an Error.
console.log(quantity.toFixed(0));