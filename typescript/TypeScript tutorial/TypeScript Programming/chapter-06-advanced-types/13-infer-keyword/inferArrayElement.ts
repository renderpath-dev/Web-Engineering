// Goal:
// Extract an array element type with infer.

// Expected result:
// The compiler extracts ProductRecord from ProductRecord[].

export {};

type ElementOf<ValueType> = ValueType extends readonly (infer ElementType)[]
    ? ElementType
    : never;

type ProductRecord = {
    id: string;
    title: string;
};

type ProductElement = ElementOf<readonly ProductRecord[]>;

const product: ProductElement = {
    id: "p1",
    title: "Keyboard",
};

console.log(product.title);