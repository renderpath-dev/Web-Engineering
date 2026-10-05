// Goal:
// Pair a runtime validator with the type it validates.

// Expected result:
// The compiler narrows unknown input after validation.

export {};

type ProductRecord = {
    id: string;
    title: string;
};

const ProductRecord = {
    is(value: unknown): value is ProductRecord {
        if (typeof value !== "object" || value === null) {
            return false;
        }

        const candidate = value as Record<string, unknown>;

        return typeof candidate["id"] === "string" && typeof candidate["title"] === "string";
    },
};

const rawValue: unknown = JSON.parse('{"id":"p1","title":"Keyboard"}');

if (ProductRecord.is(rawValue)) {
    console.log(rawValue.title);
}