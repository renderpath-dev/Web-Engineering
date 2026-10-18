// Goal:
// Return null or an expected missing lookup result

// Expected result:
// The compiler requires null checking before property access

export {};

type ProductRecord = {
    id: string;
    title: string;
};

function findProductById(productList: ProductRecord[], id:string): ProductRecord | null {
    return productList.find((product)=> product.id === id) ?? null;
}

const productList: ProductRecord[] = [
    {id:"p1", title:"Keyboard"},
];

const product = findProductById(productList,"missing");

if (product !== null) {
    console.log(product.title)
} else {
    console.log("not-found");
}