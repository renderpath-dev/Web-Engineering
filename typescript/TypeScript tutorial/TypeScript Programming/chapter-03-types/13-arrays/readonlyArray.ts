// Goal:
// Use readonly arrays to prevent mutation through a function boundary.

// Expected result:
// The compiler rejects mutation of readonly arrays.

export {};

function createSortedCopy(scoreList: readonly number[]): number[] {
    // @ts-expect-error: readonly array cannot be mutated.
    scoreList.sort();

    return [...scoreList].sort((leftScore, rightScore) => leftScore - rightScore);
}

console.log(createSortedCopy([3, 1, 2]));