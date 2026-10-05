// Goal:
// Use typeof in a type context to derive a type from a value.

// Expected result:
// The compiler keeps the value and type in sync.

export {};

const defaultProduct = {
    id: "p1",
    title: "Keyboard",
    price: 99,
};

type ProductRecord = typeof defaultProduct;

const nextProduct: ProductRecord = {
    id: "p2",
    title: "Mouse",
    price: 25,
};

console.log(nextProduct.title);