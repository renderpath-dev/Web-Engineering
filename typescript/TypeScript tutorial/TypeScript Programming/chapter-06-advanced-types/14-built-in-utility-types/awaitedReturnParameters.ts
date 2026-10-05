// Goal:
// Use Awaited, ReturnType, and Parameters.

// Expected result:
// The compiler extracts function-related types.

export {};

async function fetchProduct(id: string): Promise<{ id: string; title: string }> {
    return {
        id,
        title: "Keyboard",
    };
}

type FetchProductParams = Parameters<typeof fetchProduct>;
type FetchProductPromise = ReturnType<typeof fetchProduct>;
type FetchProductData = Awaited<FetchProductPromise>;

const params: FetchProductParams = ["p1"];
const data: FetchProductData = {
    id: "p1",
    title: "Keyboard",
};

console.log(params[0]);
console.log(data.title);