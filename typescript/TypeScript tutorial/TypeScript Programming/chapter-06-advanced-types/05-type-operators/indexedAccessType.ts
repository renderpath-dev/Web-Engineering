// Goal:
// Use indexed types to extract property value types

// Expected result:
// The compiler derives the property and array element types

export {};

type ProductRecord = {
    id: string;
    title: string;
    price: number;
    tags: string[];
};

type ProductId = ProductRecord["id"];
type ProductValue = ProductRecord[keyof ProductRecord];
type ProductTag = ProductRecord["tags"][number];

const productId: ProductId = "p1";
const productTag: ProductTag = "featured";

const productValueList: ProductValue[] = [
    "Keyboard",
    99,
    ["featured"],
];

console.log(productId);
console.log(productTag);
console.log(productValueList.length);