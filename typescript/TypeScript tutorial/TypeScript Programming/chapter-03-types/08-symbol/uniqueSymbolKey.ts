// Goal:
// Use unique symbol as a strongly typed object key.

// Expected result:
// The compiler accepts access through the same unique symbol.

export {};

const internalIdKey: unique symbol = Symbol("internalId");

type EntityRecord = {
    name: string;
    [internalIdKey]: string;
};

const entityRecord: EntityRecord = {
    name: "Order",
    [internalIdKey]: "order-1",
};

console.log(entityRecord[internalIdKey]);