// Goal:
// Convert unknown external data into a safe ProductRecord

// Expected Result:
// The parser returns a ProductRecord only after runtime checks

export {};

type ProductRecord ={
    id :string,
    price :number,
}

function isProductRecord(value:unknown) : value is ProductRecord {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const candidate = value as Record<string, unknown>;

    return typeof candidate.id === "string" && typeof candidate.price === "number";
}

const rawValue: unknown = JSON.parse('{"id":"keyboard","price":"99"}');

if (isProductRecord(rawValue)) {
    console.log(rawValue.id);
    console.log(rawValue.price + 1);
}