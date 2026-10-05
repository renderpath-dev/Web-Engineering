// Goal:
// Let TypeScript infer generic type arguments from input values.


// Expected result:
// The compiler infers string and number automaticaally

export {};

function createPair<FirstType, SecondType> (
    firstValue: FirstType,
    secondValue: SecondType,
): [FirstType, SecondType] {
    return [firstValue, secondValue];
}

const productPair = createPair("keyboard",99);

console.log(productPair[0].toUpperCase());
console.log(productPair[1].toFixed(2));