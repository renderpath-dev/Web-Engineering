// Goal:
// Use never to handle all Result error variants.

// Expected result:
// The compiler accepts exhaustive handling.

export {};

type ValidationError =
    | { kind: "missing-field"; fieldName: string }
    | { kind: "invalid-format"; fieldName: string }
    | { kind: "out-of-range"; fieldName: string };

function assertNever(value: never): never {
    throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

function renderValidationError(error: ValidationError): string {
    switch (error.kind) {
        case "missing-field":
            return `Missing ${error.fieldName}`;
        case "invalid-format":
            return `Invalid ${error.fieldName}`;
        case "out-of-range":
            return `Out of range ${error.fieldName}`;
        default:
            return assertNever(error);
    }
}

console.log(renderValidationError({ kind: "missing-field", fieldName: "email" }));