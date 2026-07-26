// Goal:
// Use a tuple for fixed-position data.

// Expected result:
// The compiler enforces tuple positions.

export {};

type Point2D = [number, number];

function formatPoint(point: Point2D): string {
    const [xValue, yValue] = point;
    return `(${xValue}, ${yValue})`;
}

console.log(formatPoint([10, 20]));

// @ts-expect-error: second tuple item must be a number.
console.log(formatPoint([10, "20"]));