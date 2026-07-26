// Goal:
// Verify that unknown must be narrowed before use.

// Expected result:
// The compiler rejects direct property access on unknown

export {};

const inputValue: unknown = {
    name:'Ada',
}

// @ts-expect-error: unknown must be narrowed before property access
console.log(inputValue.name);

if (typeof inputValue === 'object' && inputValue !== null && "name" in inputValue) {
    console.log(inputValue);
}