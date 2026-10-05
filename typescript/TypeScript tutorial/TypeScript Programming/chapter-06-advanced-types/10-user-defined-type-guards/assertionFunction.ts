// Goal:
// Use an assertion function to stop execution when data is invalid.

// Expected result:
// The compiler narrows after the assertion call.

export {};

type UserRecord = {
    id: string;
    email: string;
};

function assertUserRecord(value: unknown): asserts value is UserRecord {
    if (typeof value !== "object" || value === null) {
        throw new Error("Invalid user");
    }

    const candidate = value as Record<string, unknown>;

    if (typeof candidate["id"] !== "string" || typeof candidate["email"] !== "string") {
        throw new Error("Invalid user");
    }
}

const rawUser: unknown = JSON.parse('{"id":"u1","email":"ada@example.com"}');

assertUserRecord(rawUser);

console.log(rawUser.email.toLowerCase());

