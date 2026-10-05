// Goal:
// Brand a number to prevent mixing raw numbers with validated money amounts.

// Expected result:
// The compiler requires creation through a function.

export {};

type Brand<BaseType, BrandName extends string> = BaseType & {
    readonly __brand: BrandName;
};

type CentsAmount = Brand<number, "CentsAmount">;

function createCentsAmount(value: number): CentsAmount {
    if (!Number.isInteger(value) || value < 0) {
        throw new Error("Invalid amount");
    }

    return value as CentsAmount;
}

function formatCents(amount: CentsAmount): string {
    return `$${(amount / 100).toFixed(2)}`;
}

const amount = createCentsAmount(1299);

console.log(formatCents(amount));

// @ts-expect-error: Raw number is not a validated CentsAmount.
console.log(formatCents(1299));