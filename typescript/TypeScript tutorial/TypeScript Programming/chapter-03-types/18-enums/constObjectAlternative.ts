// Goal:
// Use an as const object as an enum alternative

// Expected result:
// The compiler derives a union type from object values

export {};

const ORDER_STATUS = {
    Pending: "pending",
    Paid: "paid",
    Shipped: "shipped",
} as const;

type OrderStaus = (typeof ORDER_STATUS) [keyof typeof ORDER_STATUS];

function formatOrderStaus (status: OrderStaus) : string {
    return status.toUpperCase();
}

console.log(formatOrderStaus(ORDER_STATUS.Paid));