// Goal:
// Compare an object type literal with a runtime object literal.

// Expected result:
// The type literal is erased, while the runtime object remains.

export {};

type ProductCard = {
    id: string;
    title: string;
};

const productCard = {
    id: "p1",
    title: "Keyboard",
};

function renderProductCard(product: ProductCard): string {
    return product.title;
}

console.log(renderProductCard(productCard));