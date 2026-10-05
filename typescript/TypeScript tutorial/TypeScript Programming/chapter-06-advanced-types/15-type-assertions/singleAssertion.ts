// Goal:
// Use a type assertion after a runtime check.

// Expected result:
// The compiler accepts property access after a guarded assertion.

export {};

type ProductRecord = {
    id: string;
    title: string;
};

function parseProduct(value: unknown): ProductRecord {
    if (typeof value !== "object" || value === null) {
        throw new Error("Invalid product");
    }

    const candidate = value as Record<string, unknown>;

    if (typeof candidate["id"] !== "string" || typeof candidate["title"] !== "string") {
        throw new Error("Invalid product");
    }

    return {
        id: candidate["id"],
        title: candidate["title"],
    };
}

const product = parseProduct(JSON.parse('{"id":"p1","title":"Keyboard"}'));

console.log(product.title);