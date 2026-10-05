// Goal:
// Use Extract and Exclude to filter union members.

// Expected result:
// The compiler accepts filtered union members.

export {};

type AppEvent =
    | "product:create"
    | "product:update"
    | "user:create"
    | "user:delete";

type ProductEvent = Extract<AppEvent, `product:${string}`>;
type NonUserDeleteEvent = Exclude<AppEvent, "user:delete">;

const productEvent: ProductEvent = "product:create";
const safeEvent: NonUserDeleteEvent = "user:create";

// @ts-expect-error: This event is excluded.
const removedEvent: NonUserDeleteEvent = "user:delete";

console.log(productEvent);
console.log(safeEvent);
console.log(removedEvent);