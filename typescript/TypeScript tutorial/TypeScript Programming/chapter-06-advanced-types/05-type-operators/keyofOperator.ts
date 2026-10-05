// Goal:
// Use keyof to limit property names to known keys

// Expected result:
// The compiler accepts valid keys and rejects unknown keys

export {};

type ProductRecord = {
    id: string;
    title: string;
    price: number;
};

function readProductValue(product: ProductRecord, key: keyof ProductRecord): string | number {
    return product[key];
}

const productRecord: ProductRecord = {
    id: "p1",
    title:"Keyboard",
    price: 99,
}