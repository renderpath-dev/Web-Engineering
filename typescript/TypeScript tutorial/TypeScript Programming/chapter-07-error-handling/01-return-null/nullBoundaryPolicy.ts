// Goal:
// Convert a nullable lower-level result into a Result at the module boundary.

// Expected result:
// The compiler forces callers to handle the result state.

export {};

type ProductRecord = {
    id: string;
    title: string;
};

type LookupResult =
    | { ok: true; product: ProductRecord }
    | { ok: false; reason: "not-found" };

function findProductById(productList: ProductRecord[], id: string): ProductRecord | null {
    return productList.find((product) => product.id === id) ?? null;
}

function getProductLookupResult(productList: ProductRecord[], id: string): LookupResult {
    const product = findProductById(productList, id);

    if (product === null) {
        return { ok: false, reason: "not-found" };
    }

    return { ok: true, product };
}

const result = getProductLookupResult([], "p1");

if (result.ok) {
    console.log(result.product.title);
} else {
    console.log(result.reason);
}