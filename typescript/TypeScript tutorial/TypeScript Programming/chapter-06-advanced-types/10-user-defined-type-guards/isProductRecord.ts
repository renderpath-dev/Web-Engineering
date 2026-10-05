// Goal:
// Use a user-defined type guard to narrow unknown data.

// Expected result:
// The compiler allows ProductRecord access after the guard.

export {};

type ProductRecord = {
    id: string;
    price: number;
};

function isProductRecord(value: unknown): value is ProductRecord {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const candidate = value as Record<string, unknown>;

    return typeof candidate["id"] === "string" && typeof candidate["price"] === "number";
}

const rawValue: unknown = JSON.parse('{"id":"p1","price":99}');

if (isProductRecord(rawValue)) {
    console.log(rawValue.price.toFixed(2));
}