// Goal:
// Handle a nullable lookup result before use.

// Expected result:
// The compiler requires null checking.

export {};

type ProductRecord = {
    id: string;
    title: string;
};

function findProductById(productList: ProductRecord[], id: string): ProductRecord | null {
    return productList.find((product) => product.id === id) ?? null;
}

const productList: ProductRecord[] = [
    { id: "keyboard", title: "Keyboard" },
];

const productRecord = findProductById(productList, "mouse");

if (productRecord !== null) {
    console.log(productRecord.title);
} else {
    console.log("Not found");
}