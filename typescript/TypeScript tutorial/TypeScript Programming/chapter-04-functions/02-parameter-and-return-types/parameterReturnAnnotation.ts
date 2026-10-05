// Goal:
// Annotate function parameters and return value

// Expected result:
// The compiler accepts this file and Node prints the formatted price

export {};


function formatPrice(amount:number, currencyCode:string):string {
    return`${currencyCode}${amount.toFixed(2)}`;
}

console.log(formatPrice(29.9,"USD"));