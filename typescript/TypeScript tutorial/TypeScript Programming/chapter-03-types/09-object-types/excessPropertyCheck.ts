// Goal:
// Verify excess property checks on object literals.

// Expected result:
// The compiler rejects direct object literals with extra properties.

export {};

type ProductCard = {
    id: string;
    title: string;
};

function renderProduct(product: ProductCard): string {
    return product.title;
}

// @ts-expect-error: extra properties are checked on direct object literals.
renderProduct({ id: "p1", title: "Keyboard", price: 99 });

const productRecord = { id: "p1", title: "Keyboard", price: 99 };
console.log(renderProduct(productRecord));