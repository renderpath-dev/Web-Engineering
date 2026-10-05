// Goal:
// Create an assertNever helper for exhaustive checks.

// Expected result:
// The compiler rejects missing variants.

export {};

type PaymentState =
    | { kind: "pending" }
    | { kind: "paid"; receiptId: string }
    | { kind: "failed"; reason: string };

function assertNever(value: never): never {
    throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

function renderPaymentState(state: PaymentState): string {
    switch (state.kind) {
        case "pending":
            return "Pending";
        case "paid":
            return state.receiptId;
        case "failed":
            return state.reason;
        default:
            return assertNever(state);
    }
}

console.log(renderPaymentState({ kind: "paid", receiptId: "r1" }));