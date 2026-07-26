// Goal:
// Use void for functions that perform side effects

// Expected result:
// The compiler accepts a function with no meaningful return value

export {};

function logMessage(messageText: string): void {
    console.log(messageText);
}

const resultValue = logMessage("Saved");

console.log(resultValue);