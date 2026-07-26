// Goal:
// Verify how let and const affect literal type widening

// Expected result:
// The compiler accepts the valid assignments and rejects the marked one.

export {}

const fixedStatus = "draft";
let mutableStatus = "draft";

const onlyDraft:"draft" = fixedStatus;

// @ts-expect-error: mutableStatus is widened to string;
const draftOnlyStatus :'draft' = mutableStatus;

mutableStatus = "published";

console.log(fixedStatus);
console.log(mutableStatus);