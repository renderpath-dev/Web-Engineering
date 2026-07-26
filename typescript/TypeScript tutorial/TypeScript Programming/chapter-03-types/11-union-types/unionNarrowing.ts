// Goal:
// Narrow a union type before using type-specific methods.

// Expected result:
// The compiler accepts narrowed branches

export {};

function formatId(idValue: string | number): string {
    if (typeof idValue === "string") {
        return idValue.toUpperCase();
    }

    return idValue.toFixed();
}

console.log(formatId("ab-12"));
console.log(formatId(42));

