// Goal:
// Create a generic result type alias

// Expected result:
// The compiler accepts success and failure states

export { };

type Result<ValueType> =
    | {
        ok: true;
        value: ValueType;
    }
    | {
        ok: false;
        errorMessage: string;
    };

function parseNumberValue(inputText: string): Result<number> {
    const parsedValue = Number.parseFloat(inputText);

    if (Number.isNaN(parsedValue)) {
        return { ok: false, errorMessage: "Invalid number" }
    };
    return { ok: true, value: parsedValue };
}

const parseResult = parseNumberValue("42");

if (parseResult.ok) {
    console.log(parseResult.value.toFixed(2));
} else {
    console.log(parseResult.errorMessage);
}