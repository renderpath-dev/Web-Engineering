// Goal:
// Show how any moves an error from compile to runtime

// Expected result:

export {};

function readProductTitle(productRecord:any):string {
    return productRecord.title.toUpperCase();
}

const brokenProductRecord ={
    name:"keyboard"
}

console.log(readProductTitle(brokenProductRecord));