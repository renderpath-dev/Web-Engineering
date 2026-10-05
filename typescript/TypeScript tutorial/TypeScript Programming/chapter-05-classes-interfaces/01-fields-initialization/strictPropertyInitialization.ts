// Goal:
// Verify strict property initialization

// Expected result
// The compiler rejects the uninitialized field

export {};

class BrokenProfileRecord {
    // @ts-expect-error: This field is not initialized
    displayName: string;

    createAt = new Date();
}

const profileRecord = new BrokenProfileRecord();

console.log(profileRecord.createAt.toISOString());