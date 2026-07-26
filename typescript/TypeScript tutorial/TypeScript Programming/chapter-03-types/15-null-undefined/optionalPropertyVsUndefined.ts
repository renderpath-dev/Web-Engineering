// Goal:
// Compare optional properties and explicit undefined.

// Expected result
// The compiler treats optional properties as possibly missing

export {};

type ProfileForm = {
    displayName: string;
    avatarUrl?: string;
};

const profileForm: ProfileForm = {
    displayName: "Ada"
};

if (profileForm.avatarUrl !== undefined) {
    console.log(profileForm.avatarUrl.toUpperCase());
}