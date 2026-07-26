// Goal:
// Use type aliases to name reusable domain types.

// Expected result:
// The compiler accepts this file

export {};

type ProductId = string;

type MoneyAmount = {
    cents:number;
    currency: "USD" | "EUR" | "CNY";
}

type ProductRecord = {
    id: ProductId;
    title: string;
    price: MoneyAmount;
};

const productRecord: ProductRecord = {
    id: "keyboard",
    title: "keyboard",
    price: {
        cents: 1599,
        currency: "USD",
    },
};

console.log(productRecord.price.cents);