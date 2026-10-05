// Goal:
// Show that call can't replace lexical this is an arrow function

// Expected result:
// Node prints undefined

export {};

const productRecord = {
    productName:"Keyboard",
};

const readName = () => {
    return (globalThis as {productName?:string}).productName;
};

console.log(readName.call(productRecord))