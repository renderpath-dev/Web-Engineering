// Goal:
// Type a callback parameter with a function type expression.

// Expected result:
// The compiler accepts valid callbacks and rejects invalid ones.

export {};

function formatEachProduct (
    productNames: string[],
    formatter:(productName:string) =>string,
): string[]{
    return productNames.map((productName)=> {
        return formatter(productName);
    });
}

const labels = formatEachProduct(["keyboard","mouse"],(productName) => {
    return productName.toUpperCase();
});

console.log(labels);

// @ts-expect-error: The formatter must return a string.
formatEachProduct(["keyboard"],(productName)=> {
    return productName.length;
});
