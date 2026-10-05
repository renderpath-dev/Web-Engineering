// Goal:
// Connect a key parameter with its value type using keyof and indexed access.

// Expected result:
// The compiler returns the exact value type for each key.

export {};

type ProductRecord = {
    id: string;
    title: string;
    price: number;
};

function getProperty<SourceType, KeyName extends keyof SourceType>(
    source: SourceType,
    key: KeyName,
): SourceType[KeyName] {
    return source[key];
}

const productRecord: ProductRecord = {
    id: "p1",
    title: "Keyboard",
    price: 99,
};

const titleText = getProperty(productRecord, "title");
const priceValue = getProperty(productRecord, "price");

console.log(titleText.toUpperCase());
console.log(priceValue.toFixed(2));

// @ts-expect-error: stock is not a key of ProductRecord.
console.log(getProperty(productRecord, "stock"));