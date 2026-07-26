// Goal:
// Use numeric literal union types for allowed rating values.

// Expected result:
// The compiler accepts allowed ratings and rejects invalid ratings.

export {};

type RatingScore = 1 | 2 | 3 | 4 | 5;

function formatRating(score: RatingScore): string {
    return `${score}/5`;
}

console.log(formatRating(5));

// @ts-expect-error: 6 is not an allowed rating score.
console.log(formatRating(6));