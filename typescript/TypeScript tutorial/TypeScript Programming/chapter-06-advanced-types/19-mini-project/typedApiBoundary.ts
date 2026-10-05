// Goal:
// Build a typed API boundary with unknown input, validation, and derived view types.

// Expected result:
// The compiler enforces validation before business access.

export {};

type Brand<BaseType, BrandName extends string> = BaseType & {
    readonly __brand: BrandName;
};

type ProductId = Brand<string, "ProductId">;

type ProductRecord = {
    id: ProductId;
    title: string;
    priceCents: number;
    tags: string[];
};

type ProductCard = Pick<ProductRecord, "id" | "title" | "priceCents">;

type ApiResult<DataType> =
    | {
    ok: true;
    data: DataType;
}
    | {
    ok: false;
    errorMessage: string;
};

function createProductId(value: string): ProductId {
    if (!value.startsWith("p_")) {
        throw new Error("Invalid product id");
    }

    return value as ProductId;
}

function isRawProduct(value: unknown): value is {
    id: string;
    title: string;
    priceCents: number;
    tags: string[];
} {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const candidate = value as Record<string, unknown>;

    return (
        typeof candidate["id"] === "string" &&
        typeof candidate["title"] === "string" &&
        typeof candidate["priceCents"] === "number" &&
        Array.isArray(candidate["tags"]) &&
        candidate["tags"].every((tagValue) => typeof tagValue === "string")
    );
}

function parseProduct(value: unknown): ApiResult<ProductRecord> {
    if (!isRawProduct(value)) {
        return {
            ok: false,
            errorMessage: "Invalid product",
        };
    }

    return {
        ok: true,
        data: {
            id: createProductId(value.id),
            title: value.title,
            priceCents: value.priceCents,
            tags: value.tags,
        },
    };
}

function toProductCard(product: ProductRecord): ProductCard {
    return {
        id: product.id,
        title: product.title,
        priceCents: product.priceCents,
    };
}

const rawValue: unknown = JSON.parse(
    '{"id":"p_1","title":"Keyboard","priceCents":9900,"tags":["hardware"]}',
);

const result = parseProduct(rawValue);

if (result.ok) {
    console.log(toProductCard(result.data).title);
} else {
    console.log(result.errorMessage);
}