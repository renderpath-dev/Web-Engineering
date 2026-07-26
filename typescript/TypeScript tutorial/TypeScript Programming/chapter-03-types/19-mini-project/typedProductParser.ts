// Goal:
// Parse unknown product data into a safe product list.

// Expected result:
// The parser accepts valid records and rejects invalid records.

export {};

type ProductRecord = {
    id: string;
    title: string;
    priceCents: number;
    tags: string[];
};

type ParseSuccess = {
    status: "success";
    data: ProductRecord[];
};

type ParseFailure = {
    status: "failure";
    errors: string[];
};

type ParseResult = ParseSuccess | ParseFailure;

function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isProductRecord(value: unknown): value is ProductRecord {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const candidate = value as Record<string, unknown>;

    return (
        typeof candidate.id === "string" &&
        typeof candidate.title === "string" &&
        typeof candidate.priceCents === "number" &&
        isStringArray(candidate.tags)
    );
}

function parseProductList(value: unknown): ParseResult {
    if (!Array.isArray(value)) {
        return {
            status: "failure",
            errors: ["Input is not an array"],
        };
    }

    const productList: ProductRecord[] = [];
    const errorList: string[] = [];

    value.forEach((item, index) => {
        if (isProductRecord(item)) {
            productList.push(item);
        } else {
            errorList.push(`Invalid product at index ${index}`);
        }
    });

    if (errorList.length > 0) {
        return {
            status: "failure",
            errors: errorList,
        };
    }

    return {
        status: "success",
        data: productList,
    };
}

const rawValue: unknown = JSON.parse(
    '[{"id":"keyboard","title":"Keyboard","priceCents":9900,"tags":["input","hardware"]}]'
);

const parseResult = parseProductList(rawValue);

if (parseResult.status === "success") {
    console.log(parseResult.data[0]?.title ?? "Empty");
} else {
    console.log(parseResult.errors.join(","));
}