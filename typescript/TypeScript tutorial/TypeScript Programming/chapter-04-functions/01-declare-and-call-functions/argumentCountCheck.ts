// Goal:
// Verify how TypeScript checks the number of arguments

// Expected results:
// The compiler rejects the marked calls

export {};

function createInventoryLabel(productName:string, stockCount:number): string {
    return `${productName} :${stockCount}`;
}

console.log(createInventoryLabel("keyboard",12));

// @ts-expect-error: Missing required arg
createInventoryLabel("keyboard");

// @ts-expect-error: Too many arguments for this function signature
createInventoryLabel("keyboard",12,"warehouse-a");