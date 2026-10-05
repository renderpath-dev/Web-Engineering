// Goal:
// Use an interface to describe an object shape

// Expected result:
// The compiler accepts compatible objects

export {};

interface ProductCard {
    id: string;
    title: string;
    price: number;
}

function renderProductCard(productCard: ProductCard):string {
    return `${productCard.title}:${productCard.price}`
}

const keyboardCard = {
    id:"p1",
    title:"Keyboard",
    price:99,
    stockCount:10,
};

console.log(renderProductCard(keyboardCard));