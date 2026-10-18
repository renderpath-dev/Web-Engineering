// Goal:
// Throw an Error object for an invalid business invariant

// Expected result:
// Node catches and prints the error message

export {};

function parseRequiredPositiveInteger(inputText: string):number {
    const parsedValue = Number(inputText);

    if (!Number.isInteger(parsedValue)) {
        throw new TypeError("Expected an integer");
    }

    if(parsedValue <=0) {
        throw new RangeError("Expected a positive integer");
    }

    return parsedValue;
}

try {
    console.log(parseRequiredPositiveInteger("0"));
} catch (errorValue) {
    if (errorValue instanceof Error) {
        console.log(errorValue.name);
        console.log(errorValue.message);
    }
}