// Goal:
// Verify assignment based on required members.

// Expected result:
// The compiler accepts compatible assignment and rejects missing members.

export {};

type UserSummary = {
    id: string;
    displayName: string;
};

const fullUserRecord = {
    id: "u1",
    displayName: "Ada",
    email: "ada@example.com",
};

const userSummary: UserSummary = fullUserRecord;

const missingNameRecord = {
    id: "u2",
};

// @ts-expect-error: displayName is required.
const brokenSummary: UserSummary = missingNameRecord;

console.log(userSummary.displayName);
console.log(typeof brokenSummary);