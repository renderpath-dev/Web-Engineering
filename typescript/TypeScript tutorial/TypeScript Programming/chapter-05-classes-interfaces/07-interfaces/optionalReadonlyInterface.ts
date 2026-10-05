// Goal:
// Use optional and readonly properties in an interface

// Expected result:
// The compiler rejects reassignment to readonly property

export {};

interface UserProfile {
    readonly id: string;
    displayName: string;
    avatarUrl?: string;
}

const userProfile: UserProfile = {
    id:"u1",
    displayName:"Ada",
};

userProfile.displayName = "Ada Lovelace";

// @ts-expect-error: id is readonly
userProfile.id = "u2";

console.log(userProfile.avatarUrl ?? "no-avatar");