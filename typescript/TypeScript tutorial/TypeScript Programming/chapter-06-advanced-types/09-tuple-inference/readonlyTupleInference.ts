// Goal:
// Preserve literal tuple information with as const.

// Expected result:
// The compiler treats the tuple as readonly literal values.

export {};

const routeParts = ["products", "p1"] as const;

type RouteName = typeof routeParts[0];
type ProductId = typeof routeParts[1];

const routeName: RouteName = "products";
const productId: ProductId = "p1";

// @ts-expect-error: routeParts is readonly.
routeParts.push("extra");

console.log(routeName);
console.log(productId);