// Goal:
// Verify that all code paths must return a value.

// Expected result:
// With noImplicitReturns enabled, the compiler rejects missing return paths.

export {};

type ParseMode = "number" | "text";

// @ts-expect-error: Not all code paths return a value.
function parseValue(inputText: string, mode: ParseMode): number | string {
    if (mode === "number") {
        return Number(inputText);
    }

    console.log(`unhandled mode:${mode}`);
}

console.log(parseValue("42", "number"));