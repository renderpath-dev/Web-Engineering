// Goal:
// Verify that a default parameter receives a fallback value

// Expected result
// The compiler accepts this file and Node prints the normalized limit


export {};

function normalizePageSize(pageSize=20):number {
    return Math.min(Math.max(pageSize,1),100);
}

console.log(normalizePageSize());
console.log(normalizePageSize(50));
console.log(normalizePageSize(undefined));