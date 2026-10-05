// Goal:
// Compare Record with string keys and unknown property access

// Expected result:
// with noUncheckedIndexedAccess, unknown keys include undefined.

export {};

type ScoreMap = Record<string, number>;

const scoreMap : ScoreMap= {
    quality:90,
};

const qualityScore = scoreMap["quality"];
const missingScore = scoreMap["speed"];

//@ts-expect-error: missingScore may be undefined.
const strictScore: number = missingScore;

console.log(qualityScore);
console.log(strictScore);