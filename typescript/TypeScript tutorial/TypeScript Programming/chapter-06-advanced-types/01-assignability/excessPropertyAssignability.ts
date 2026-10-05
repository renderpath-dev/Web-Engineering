// Goal:
// Compare direct object literal checking and variable assignment.

// Expected result:
// The compiler rejects excess properties on direct object literals.

export {};

type ProductCard = {
    id: string;
    title: string;
};

const productSource = {
    id: "p1",
    title: "Keyboard",
    price: 99,
};

const acceptedCard: ProductCard = productSource;

const rejectedCard: ProductCard = {
    id: "p2",
    title: "Mouse",
    // @ts-expect-error: Direct object literals receive excess property checks.
    price: 25,
};

console.log(acceptedCard.title);
console.log(typeof rejectedCard);