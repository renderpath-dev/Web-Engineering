// Goal:
// Narrow a union type through control flow.

// Expected result:
// The compiler accepts branch-specific operations

export {};

type InputValue = string | number | null;

function formatInput(inputValue: InputValue):string {
    if (inputValue === null) {
        return "empty";
    }

    if (typeof inputValue === "number") {
        return inputValue.toFixed(2);
    }

    return inputValue.trim().toUpperCase();
}

console.log(formatInput("keyboard"));
console.log(formatInput(12));
console.log(formatInput(null));