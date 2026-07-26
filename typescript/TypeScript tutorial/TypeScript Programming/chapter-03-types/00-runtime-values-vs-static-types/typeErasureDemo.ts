// Goal:
// Verify that TypeScript types are erased from JavaScript output.

// Expected result:
// The emitted JavaScript contains no UserProfile type.

export {};

type UserProfile = {
    name:string,
    role:'admin' | 'member';
};

const userProfile: UserProfile = {
    name:'ada',
    role:'admin',
};

console.log(userProfile.role);