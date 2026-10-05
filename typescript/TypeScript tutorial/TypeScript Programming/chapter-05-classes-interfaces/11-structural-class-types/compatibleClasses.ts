// Goal:
// Verify that classes are structurally compatible.

// Expected result:
// The compiler accepts assignment between identical class shapes.

export {};

class Point2D {
  x = 0;
  y = 0;
}

class Coordinate2D {
  x = 0;
  y = 0;
}

const point: Point2D = new Coordinate2D();

console.log(point.x + point.y);
