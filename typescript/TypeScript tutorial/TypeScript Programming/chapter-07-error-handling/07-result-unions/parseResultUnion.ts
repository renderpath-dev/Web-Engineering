// Goal:
// Use a Result union to represent success and failure.

// Expected result:
// The compiler narrows value and error branches.

export {};

type Result<ValueType, ErrorType> =
    | { ok: true; value: ValueType }
    | { ok: false; error: ErrorType };

type ParseError =
    | { kind: "empty-input" }
    | { kind: "invalid-number"; inputText: string };

function parsePositiveNumber(inputText: string): Result<number, ParseError> {
    if (inputText.trim().length === 0) {
        return { ok: false, error: { kind: "empty-input" } };
    }

    const parsedValue = Number(inputText);

    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
        return { ok: false, error: { kind: "invalid-number", inputText } };
    }

    return { ok: true, value: parsedValue };
}

const result = parsePositiveNumber("42");

if (result.ok) {
    console.log(result.value.toFixed(2));
} else {
    console.log(result.error.kind);
}