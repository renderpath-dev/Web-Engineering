// Goal:
// Avoid throwing plain strings.

// Expected result:
// Node shows why Error objects are easier to inspect.

export {};

try {
    throw "Request failed";
} catch (errorValue) {
    console.log(typeof errorValue);

    if (errorValue instanceof Error) {
        console.log(errorValue.message);
    } else {
        console.log("not-error-object");
    }
}

try {
    throw new Error("Request failed");
} catch (errorValue) {
    console.log(errorValue instanceof Error);

    if (errorValue instanceof Error) {
        console.log(errorValue.message);
    }
}