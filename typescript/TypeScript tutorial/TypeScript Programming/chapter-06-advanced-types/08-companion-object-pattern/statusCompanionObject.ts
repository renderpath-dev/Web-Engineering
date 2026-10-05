// Goal:
// Create a runtime object and derive a static union type from it.

// Expected result:
// The compiler accepts known statuses and rejects unknown statuses.

export {};

const OrderStatus = {
    Draft: "draft",
    Paid: "paid",
    Shipped: "shipped",
} as const;

type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

function renderStatus(status: OrderStatus): string {
    return status.toUpperCase();
}

console.log(renderStatus(OrderStatus.Paid));

// @ts-expect-error: This status is not in OrderStatus.
console.log(renderStatus("cancelled"));