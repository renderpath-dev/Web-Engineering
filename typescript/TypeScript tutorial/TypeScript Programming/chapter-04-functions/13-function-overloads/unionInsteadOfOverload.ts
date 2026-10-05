// Goal:
// prefer a union parameter when overloads do not add value.

// Expected result:
// The compiler accept union input

export {};

function getItemCount(inputValue:string | unknown[]): number {
    return inputValue.length;
}

const inputValue = Math.random() > 0.5 ? "hello" : [1,2,3];

console.log(getItemCount(inputValue));