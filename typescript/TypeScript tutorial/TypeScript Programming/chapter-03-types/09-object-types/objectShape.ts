// Goal:
// Verify structural object typing

// Expected result:
// The compiler accepts objects with compatible shapes

export {};

type ProductCard = {
    id :string;
    title:string;
    price:number;
}

function renderProductCard(product:ProductCard) {
    return `${product.title} :${product.price}`;
}

const keyboardRecord = {
    id: "keyboard",
    title: "Keyboard",
    price: 99,
    stock: 12,
};

console.log(renderProductCard(keyboardRecord))