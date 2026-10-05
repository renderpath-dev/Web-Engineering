// Goal:
// Compare safe narrowing with non-null assertion.

// Expected result:
// The compiler accepts non-null assertion but runtime can still fail.

export {};

function findProductTitle(id: string): string | undefined {
    if (id === "p1") {
        return "Keyboard";
    }

    return undefined;
}

const safeTitle = findProductTitle("p1");

if (safeTitle !== undefined) {
    console.log(safeTitle.toUpperCase());
}

const unsafeTitle = findProductTitle("missing")!;

try {
    console.log(unsafeTitle.toUpperCase());
} catch (errorValue) {
    console.log(errorValue instanceof TypeError);
}