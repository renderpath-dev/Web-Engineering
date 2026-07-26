// Goal:
// Separate alias names, property names, and property value types.

// Expected result:
// The compiler checks each property value against its declared type.

export {};

type ProductId = string;

type ProductRecord = {
    id: ProductId;
    title: string;
};

const productRecord: ProductRecord = {
    id: "p1",
    title: "Keyboard",
};

const invalidProductRecord: ProductRecord = {
    // @ts-expect-error: id must be a ProductId, which is a string alias.
    id: 123,
    title: "Mouse",
};

console.log(productRecord.title, invalidProductRecord.title);