// Goal:
// Compose object requirements with an intersection type.

// Expected result:
// The compiler requires all properties from both sides.

export {};

type TimestampFields = {
    createdAt: string;
    updatedAt: string;
};

type ProductFields = {
    id: string;
    title: string;
};

type ProductRecord = ProductFields & TimestampFields;

const productRecord: ProductRecord = {
    id: "keyboard",
    title: "Keyboard",
    createdAt: "2026-05-13T00:00:00.000Z",
    updatedAt: "2026-05-13T00:00:00.000Z",
};

console.log(productRecord.title);