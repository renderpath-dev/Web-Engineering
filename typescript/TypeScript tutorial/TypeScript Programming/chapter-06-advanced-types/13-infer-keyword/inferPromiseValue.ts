// Goal:
// Extract the resolved value type from a Promise-like type.

// Expected result:
// The compiler extracts the final ProductRecord type.

export {};

type UnwrapPromise<ValueType> = ValueType extends Promise<infer ResolvedType>
    ? ResolvedType
    : ValueType;

type ProductRecord = {
    id: string;
    title: string;
};

async function fetchProduct(): Promise<ProductRecord> {
    return {
        id: "p1",
        title: "Keyboard",
    };
}

type FetchedProduct = UnwrapPromise<ReturnType<typeof fetchProduct>>;

const product: FetchedProduct = {
    id: "p1",
    title: "Keyboard",
};

console.log(product.title);