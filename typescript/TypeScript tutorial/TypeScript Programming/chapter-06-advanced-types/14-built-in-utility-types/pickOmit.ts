// Goal:
// Use Pick and Omit to derive view and form types.

// Expected result:
// The compiler derives smaller object types.

export {};

type ProductRecord = {
    id: string;
    title: string;
    price: number;
    internalCost: number;
};

type ProductCard = Pick<ProductRecord, "id" | "title" | "price">;
type PublicProduct = Omit<ProductRecord, "internalCost">;

const card: ProductCard = {
    id: "p1",
    title: "Keyboard",
    price: 99,
};

const publicProduct: PublicProduct = card;

console.log(publicProduct.title);