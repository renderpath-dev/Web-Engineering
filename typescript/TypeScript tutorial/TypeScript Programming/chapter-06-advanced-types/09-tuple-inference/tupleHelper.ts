// Goal:
// Preserve tuple item positions with a helper function

// Expected result:
// The compiler preserve [string, number] rather than widening to array

export {};

function tuple<FirstType, SecondType>(
    firstValue:FirstType,
    secondValue:SecondType,
):[FirstType,SecondType] {
    return [firstValue, secondValue];
}

const productPair = tuple("Keyboard",99);

const titleText = productPair[0];
const priceValue = productPair[1];

console.log(titleText.toUpperCase());
console.log(priceValue.toFixed(2));