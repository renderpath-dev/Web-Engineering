// Goal:
// Name a function type with type alias

// Expected result:
// The compiler accepts this file.

export {};

type ProductFormatter = (productName:string, index:number) => string;

function formatProductList(productNames:string[],formatter:ProductFormatter):string[] {
    return productNames.map(formatter);
}

console.log(formatProductList(["keyboard","mouse"],(productName, index)=>{
    return`${index}:${productName}`;
}))