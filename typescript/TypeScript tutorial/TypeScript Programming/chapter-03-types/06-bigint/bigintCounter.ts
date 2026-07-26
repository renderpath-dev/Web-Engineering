// Goal:
// Verify bigint typing and arithmetic rules.

// Expected result:
// The compiler accepts bigint arithmetic and rejects mixed arithmetic.

export {};

const largeId: bigint = 9007199254740993n;
const nextLargeId = largeId + 1n;

console.log(nextLargeId);

const smallCount = 1;

// @ts-expect-error: bigint and number cannot be mixed in arithmetic.
console.log(largeId + smallCount);