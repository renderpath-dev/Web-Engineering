// Goal:
// Avoid marking callback parameters optinoal when the caller always receives them

// Expected result:
// The compiler accepts the correct callback type

export {};

function visitProductNames (
    productNames: string[],
    visitor:(productName:string, index:number) => void,
):void {
    for (let index=0; index < productNames.length;index +=1) {
        const productName= productNames[index];

        if (productName !== undefined) {
            visitor(productName,index);
        }
    }
}

visitProductNames(["keyboard","mouse"],(productName,index) => {
    console.log(`${index}:${productName}`);
})