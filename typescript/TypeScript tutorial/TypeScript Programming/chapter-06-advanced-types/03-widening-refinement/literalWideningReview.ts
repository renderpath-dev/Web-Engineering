// Goal:
// Review literal widening and const assertion

// Expected result:
// The compiler accepts literal-preserving values and rejects widened values

export {};

let mutableStatus = "draft";
const fixedStatus = "draft";
const statusConfig = {
    status:"draft",
} as const;

// @ts-expect-error: mutableStatus is widened to string.
const onlyDraftFromLet: "draft" = mutableStatus;

const onlyDraftFromConst: "draft" = fixedStatus;
const onlyDraftFromObject: "draft" = statusConfig.status;

console.log(onlyDraftFromLet);
console.log(onlyDraftFromConst);
console.log(onlyDraftFromObject);
console.log(typeof onlyDraftFromLet);