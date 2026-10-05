// Goal:
// Show why declaration without runtime implementation is unsafe.

// Expected result:
// This example demonstrates the risk conceptually.

export {};

declare global {
    interface String {
        toTitleCaseForDemo(): string;
    }
}

const titleText = "hello";

// Do not call titleText.toTitleCaseForDemo() unless the runtime method exists.
console.log(titleText.toUpperCase());