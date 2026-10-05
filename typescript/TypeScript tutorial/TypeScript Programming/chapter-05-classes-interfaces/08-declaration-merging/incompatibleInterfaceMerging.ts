// Goal:
// Show that incompatible merged properties are rejected.

// Expected result:
// The compiler rejects incompatible property declarations.

export {};

interface MergeTarget {
  id: string;
}

interface MergeTarget {
  // @ts-expect-error: Merged property declarations must have compatible types.
  id: number;
}

const mergeTarget: MergeTarget = {
  id: "m1",
};

console.log(mergeTarget.id);
