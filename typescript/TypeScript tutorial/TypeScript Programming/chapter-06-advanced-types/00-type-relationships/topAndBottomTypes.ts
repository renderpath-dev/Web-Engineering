// Goal:
// Compare unknown as a top type and never as a bottom type.

// Expected result:
// The compiler accepts safe assignments and rejects unsafe ones.

export {};

let topValue: unknown;

topValue = "hello";
topValue = 42;
topValue = { id: "p1" };

function failWithMessage(messageText: string): never {
    throw new Error(messageText);
}

const impossibleValue = failWithMessage("failed");

// @ts-expect-error: unknown cannot be assigned to string without narrowing.
const titleText: string = topValue;

console.log(typeof impossibleValue);
console.log(typeof titleText);