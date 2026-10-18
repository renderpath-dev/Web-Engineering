// Goal:
// Show why nullable return values must be checked.

// Expected result:
// The compiler rejects direct property access on a nullable value.

export {};

type UserRecord = {
    id: string;
    email: string;
};

function findUserById(userList: UserRecord[], id: string): UserRecord | null {
    return userList.find((user) => user.id === id) ?? null;
}

const user = findUserById([], "u1");

// @ts-expect-error: user may be null.
console.log(user.email.toLowerCase());