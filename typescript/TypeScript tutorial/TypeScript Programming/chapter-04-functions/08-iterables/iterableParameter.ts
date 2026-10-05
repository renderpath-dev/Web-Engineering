// Goal:
// Accept any iterable source instead of only arrays

// Expected result:
// The compiler accepts arrays, set, and generators

export {};

function collectLabels(sourceLabels: Iterable<string>): string[] {
    return Array.from(sourceLabels);
}

function* createGeneratedLabels(): Generator<string, void, unknown> {
    yield "alpha";
    yield "beta";
}

console.log(collectLabels(["draft","published"]));
console.log(collectLabels(new Set(["admin","memebr"])));
console.log(collectLabels(createGeneratedLabels()));
