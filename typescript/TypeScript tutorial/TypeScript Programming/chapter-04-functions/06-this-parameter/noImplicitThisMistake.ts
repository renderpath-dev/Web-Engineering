// Goal:
// Verify that noImplicitThis catches unsafe this usage.

// Expected result:
// The compiler rejects the implicit this usage

export {};

function createBrokenReader() {
    return function () {
        // @ts-expect-error: this has no declared type.
        return this.productName;
    };
}

const reader = createBrokenReader();

console.log(typeof reader);