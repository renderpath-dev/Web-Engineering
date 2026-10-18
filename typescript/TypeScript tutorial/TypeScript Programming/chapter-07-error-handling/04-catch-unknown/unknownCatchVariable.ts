// Goal:
// Narrow an unknown catch variable before using it.

// Expected result:
// The compiler requires narrowing before reading message.

export {};

try {
    throw new Error("Network failed");
} catch (errorValue) {
    // @ts-expect-error: errorValue is unknown.
    console.log(errorValue.message);

    if (errorValue instanceof Error) {
        console.log(errorValue.message);
    }
}