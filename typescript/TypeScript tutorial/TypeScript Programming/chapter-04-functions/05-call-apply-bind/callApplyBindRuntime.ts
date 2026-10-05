// Goal:
// Verify call, appl, and bind runtime behavior.

// Expected result:
// The compiler accepts this file and Node prints formattedd labels

export {};

type PriceContext = {
    currencyCode: string;
};

function formatContextPrice (this:PriceContext,amountValue:number):string {
    return `${this.currencyCode} ${amountValue.toFixed(2)}`;
}

const usedContext: PriceContext = {
    currencyCode:"USD",
};


console.log(formatContextPrice.call(usedContext,12.5));
console.log(formatContextPrice.apply(usedContext,[15]));
const boundFormatter = formatContextPrice.bind(usedContext);
console.log(boundFormatter(20))