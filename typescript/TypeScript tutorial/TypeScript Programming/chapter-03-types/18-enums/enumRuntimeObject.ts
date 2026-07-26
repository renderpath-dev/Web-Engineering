// Goal:
// Verify that enum creates a runtime object.

// Expected result:
// Node prints enum values and the enum object

export {};

enum OrderStatus {
    Pending = "pending",
    Paid = "paid",
    Shipped = "shipped",
}

function formatOrderStatus(status: OrderStatus) : string {
    return status.toUpperCase();
}

console.log(formatOrderStatus(OrderStatus.Paid));
console.log(OrderStatus);