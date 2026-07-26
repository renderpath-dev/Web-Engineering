// Goal:
// Compare explicit annotation and type inference

// Expected result:
// The compiler accepts this file.

export {}

const explicitPrice:number = 99;
const inferredPrice =99;

function calculateTotalPrice(unitPrice:number,quantity:number) :number  {
    return unitPrice * quantity;
}

const totalPrice= calculateTotalPrice(explicitPrice,2)
console.log(totalPrice);
console.log(inferredPrice);