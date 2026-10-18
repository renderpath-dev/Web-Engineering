// Goal:
// Return an Error object instead of throwing it.

// Expected result:
// The caller handles both value and error branches.

export {};

function parsePort(inputText: string): number | Error {
    const parsedValue = Number(inputText);

    if (!Number.isInteger(parsedValue)) {
        return new TypeError("Port must be an integer");
    }

    if (parsedValue <= 0 || parsedValue > 65535) {
        return new RangeError("Port is out of range");
    }

    return parsedValue;
}

const result = parsePort("70000");

if (result instanceof Error) {
    console.log(result.name);
    console.log(result.message);
} else {
    console.log(result.toFixed(0));
}