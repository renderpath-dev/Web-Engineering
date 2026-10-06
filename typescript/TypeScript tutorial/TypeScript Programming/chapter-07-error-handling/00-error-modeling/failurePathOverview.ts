// Goal:
// Compare different failure path shapes.

// Expected result:
// The compiler accepts explicit failure modeling.

export {};

type ProductRecord = {
    id: string;
    title: string;
};

type Result<ValueType, ErrorType> =
    | { ok: true; value: ValueType }
    | { ok: false; error: ErrorType };

function findProductOrNull(productList: ProductRecord[], id: string): ProductRecord | null {
    return productList.find((product) => product.id === id) ?? null;
}

function findProductOrThrow(productList: ProductRecord[], id: string): ProductRecord {
    const product = productList.find((item) => item.id === id);

    if (product === undefined) {
        throw new Error(`Missing product: ${id}`);
    }

    return product;
}

function findProductResult(
    productList: ProductRecord[],
    id: string,
): Result<ProductRecord, string> {
    const product = productList.find((item) => item.id === id);

    if (product === undefined) {
        return { ok: false, error: `Missing product: ${id}` };
    }

    return { ok: true, value: product };
}

const productList: ProductRecord[] = [
    { id: "p1", title: "Keyboard" },
];

console.log(findProductOrNull(productList, "p2"));
console.log(findProductResult(productList, "p2"));
console.log(findProductOrThrow(productList, "p1").title);