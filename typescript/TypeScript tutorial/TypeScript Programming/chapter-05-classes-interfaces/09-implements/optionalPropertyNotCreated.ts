// Goal:
// Show that implements does not create optional properties on the class instance

// Expected result:
// The compiler rejects accessing a property not declared in the class

export {};

interface ProfileShape {
    id: string;
    avatarUrl?: string;
}

class ProfileRecord implements ProfileShape {
    id = "u1";
}

const profileRecord = new ProfileRecord();

// @ts-expect-error: implements does not create avatarUrl on ProfileRecord
profileRecord.avatarUrl = "https://example.com/avatar.png";

console.log(profileRecord.id);