// Goal:
// Write the type boundary before the implementation

// Expected result:
// The compiler guides the implementation

export {};

type CurrencyCode = "USD" | "EUR" | "JPY";

type PriceFormatter = (amountValue: number, currencyCode: CurrencyCode) => string;

const formatPrice: PriceFormatter = (amountValue, currencyCode) => {
    return `${currencyCode} ${amountValue.toFixed(2)}`;
};

console.log(formatPrice(66,"USD"));
// @ts-expect-error: Currency code must be known.
console.log(formatPrice(99,"GBP"));