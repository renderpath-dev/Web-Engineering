// Goal:
// Simulate nominal types with string brands.

// Expected result:
// The compiler rejects mixing different branded ids.

export {};

type Brand<BaseType, BrandName extends string> = BaseType & {
    readonly __brand: BrandName;
};

type UserId = Brand<string, "UserId">;
type ProductId = Brand<string, "ProductId">;

function createUserId(value: string): UserId {
    return value as UserId;
}

function createProductId(value: string): ProductId {
    return value as ProductId;
}

function loadUser(userId: UserId): string {
    return `user:${userId}`;
}

const userId = createUserId("u1");
const productId = createProductId("p1");

console.log(loadUser(userId));

// @ts-expect-error: ProductId is not assignable to UserId.
console.log(loadUser(productId));