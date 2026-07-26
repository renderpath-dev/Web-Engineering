// Goal:
// Verify that any disables useful type checking.

// Expected result:
// The compiler accepts unsafe operations.

export {};

let responseBody: any = {
    id: "order-1",
    total: 120,
};

const orderId: number = responseBody.id;
const upperText = responseBody.total.toUpperCase();

console.log(orderId);
console.log(upperText);