// Goal:
// Verify try, catch, and finally execution order.

// Expected result:
// Node prints cleanup even when an error is thrown.

export {};

function readSettingsText(): string {
    throw new Error("Settings unavailable");
}

try {
    console.log("before-read");
    console.log(readSettingsText());
    console.log("after-read");
} catch (errorValue) {
    if (errorValue instanceof Error) {
        console.log(`caught:${errorValue.message}`);
    }
} finally {
    console.log("cleanup");
}