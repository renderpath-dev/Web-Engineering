// Goal:
// Use explicit return type to protect a function boundary.

// Expected result:
// The compiler rejects the marked return value.

export {};

function calculateDiscountedPrice(priceValue: number, discountRate: number): number {
    if (discountRate <= 0) {
        return priceValue;
    }

    // @ts-expect-error: The declared return type is number.
    return `${priceValue * (1 - discountRate)}`;
}