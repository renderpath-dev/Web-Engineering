// Goal:
// Type a rest parameter as an array

// Expected result:
// The compiler accepts this file and Node prints the sum

export {};

function sumNumbers(...numberValues:number[]): number {
    return numberValues.reduce((totoalValue,currentValue) => {
        return totoalValue + currentValue
    },0);
}

console.log(sumNumbers(123,434,211));