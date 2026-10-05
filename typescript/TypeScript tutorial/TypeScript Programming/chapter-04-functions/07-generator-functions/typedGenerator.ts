// Goal:
// Type yield value, return value, and next input value.

// Expected result:
// The compiler accepts correctly typed next values.

export {};

function* createMultiplier(): Generator<number,string,number> {
    const firstInput = yield 1;
    const secondInput = yield firstInput * 2;

    return `final:${secondInput}`;
}

const multiplier = createMultiplier();

console.log(multiplier.next());
console.log(multiplier.next(10));
console.log(multiplier.next(20));