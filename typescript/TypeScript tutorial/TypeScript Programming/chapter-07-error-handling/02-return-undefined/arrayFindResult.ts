// Goal:
// Handle Array.find returning undefined.

// Expected result:
// The compiler rejects unsafe access to a find result.

export {};

const statusList = ["draft", "paid", "shipped"] as const;

const matchedStatus = statusList.find((status) => {
    return status.startsWith("x");
});

// @ts-expect-error: matchedStatus may be undefined.
console.log(matchedStatus.toUpperCase());

if (matchedStatus !== undefined) {
    console.log(matchedStatus.toUpperCase());
}