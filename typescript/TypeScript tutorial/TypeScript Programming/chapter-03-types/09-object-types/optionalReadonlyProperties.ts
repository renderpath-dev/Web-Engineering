// Goal:
// Use optional and readonly object properties

// Expected result
// The compiler rejects assignment to a readonly property

export {};

type UserProfile = {
    readonly id : string;
    name : string;
    avatarUrl?: string;
}

const userProfile: UserProfile = {
    id: "user-1",
    name: "Ada",
};

userProfile.name = "Grace";

// @ts-expect-error: id is readonly.
userProfile.id = "user-2";

console.log(userProfile.name);