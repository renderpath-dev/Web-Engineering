// Goal:
// Observe contextual typing in an array callback

// Expected result:
// The compiler infers productName as string

export {};

const productNames = ["keyboard","mouse"];

const labels = productNames.map((productName,index)=> {
    return `${index}:${productName.toUpperCase()}`;
});

console.log(labels);