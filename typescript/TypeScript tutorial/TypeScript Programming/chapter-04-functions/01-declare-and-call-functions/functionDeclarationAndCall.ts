// Goal:
// Declare and call a function with typed parameters

// Expected result
// The compiler accepts this file and Node prints the summary

export {};

function createOrderSummary(orderId:string, totalPrice:number) : string {
    return `${orderId}: ${totalPrice}`;
}

const summaryText = createOrderSummary("order-1",200);
console.log(summaryText);
