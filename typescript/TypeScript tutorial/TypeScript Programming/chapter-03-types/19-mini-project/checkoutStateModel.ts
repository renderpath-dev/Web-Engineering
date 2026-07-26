// Goal:
// Model checkout UI state with discriminated unions and exhaustive checks.

// Expected result:
// The compiler enforces complete state handling.

export {};

type CartItem = {
    productId: string;
    quantity: number;
};

type CheckoutState =
    | { status: "empty" }
    | { status: "editing"; items: CartItem[] }
    | { status: "submitting"; items: CartItem[] }
    | { status: "submitted"; orderId: string }
    | { status: "failed"; message: string; items: CartItem[] };

function assertNever(value: never): never {
    throw new Error(`Unexpected state: ${JSON.stringify(value)}`);
}

function renderCheckoutState(state: CheckoutState): string {
    switch (state.status) {
        case "empty":
            return "Cart is empty";
        case "editing":
            return `Editing ${state.items.length} items`;
        case "submitting":
            return `Submitting ${state.items.length} items`;
        case "submitted":
            return `Order ${state.orderId} submitted`;
        case "failed":
            return `${state.message}: ${state.items.length} items kept`;
        default:
            return assertNever(state);
    }
}

console.log(
    renderCheckoutState({
        status: "editing",
        items: [{ productId: "keyboard", quantity: 1 }],
    })
);