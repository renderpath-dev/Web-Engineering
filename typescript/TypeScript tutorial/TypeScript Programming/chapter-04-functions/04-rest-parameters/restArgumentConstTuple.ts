// Goal:
// Use a const tuple when spreading arguments into a fixed-parameters function

// Expected result:
// The compiler accepts the const tuple call

export {};

function createPointLabel(xCoordinate:number, yCoordinate:number):string {
    return `(${xCoordinate}, ${yCoordinate})`;
}

const pointPair = [10,20] as const;

console.log(createPointLabel(...pointPair));