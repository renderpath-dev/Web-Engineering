// Goal:
// Preserve array element type in the return value.

// Expected result:
// The return type includes undefined because the array may be empty

export {};

function getFirstElement<ElementType>(items:ElementType[]):ElementType | undefined {
    return items[0];
}

const firstName =getFirstElement(['Ada','Grace']);
const firstScore = getFirstElement([90,85]);

console.log(firstName?.toUpperCase());
console.log(firstScore?.toFixed());