// Goal:
// normalize undefined from a lower-level API to null in a public function

// Expected result:
// The public function returns a stable nullable result

export {};

type ProfileRecord = {
    id: string;
    displayName: string;
}

const profileMap = new Map<string, ProfileRecord>();

function findProfilePublic(id:string) : ProfileRecord | null {
    return profileMap.get(id) ?? null;
}

console.log(findProfilePublic("u1"));