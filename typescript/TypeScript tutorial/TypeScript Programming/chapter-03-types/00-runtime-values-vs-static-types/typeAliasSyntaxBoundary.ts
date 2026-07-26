// Goal:
// Split a type alias declaration into syntax roles

// Expected result:
// The compiler uses the alias for checking, but no alias exists at runtime

export {};

type ProductId= string;

type ProductRecord = {
    id: ProductId;
    title: string;
};

const productRecord: ProductRecord = {
    id: "p1",
    title:"keyboard"
};

console.log(productRecord.id);