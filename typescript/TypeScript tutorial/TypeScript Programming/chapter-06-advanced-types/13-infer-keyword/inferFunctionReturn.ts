// Goal:
// Extract a function return type with infer.

// Expected result:
// The compiler extracts the return object type.

export {};

type ReturnValueOf<FunctionType> = FunctionType extends (...args: never[]) => infer ReturnType
    ? ReturnType
    : never;

function createProduct() {
    return {
        id: "p1",
        title: "Keyboard",
    };
}

type CreatedProduct = ReturnValueOf<typeof createProduct>;

const product: CreatedProduct = createProduct();

console.log(product.title);