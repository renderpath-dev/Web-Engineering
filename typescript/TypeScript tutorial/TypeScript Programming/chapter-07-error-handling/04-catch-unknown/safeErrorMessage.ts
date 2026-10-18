// Goal:
// Convert an unknown thrown value into a safe message

// Expected result:
// Node prints messages for different thrown value shapes

export {};

function getErrorMessage(errorValue: unknown): string {
    if (errorValue instanceof Error) {
        return errorValue.message;
    }

    if (typeof errorValue === "string") {
        return errorValue;
    }

    return "Unknown error";
}

const thrownValues: unknown[] = [
    new Error("Broken"),
    "Plain failure",
    {message: "object-like"},
];

for (const thrownValue of thrownValues) {
    console.log(getErrorMessage(thrownValue));
}