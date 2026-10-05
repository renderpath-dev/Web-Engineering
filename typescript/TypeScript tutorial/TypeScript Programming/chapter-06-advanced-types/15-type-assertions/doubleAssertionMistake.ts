// Goal:
// Show why double assertion is dangerous.

// Expected result:
// The file compiles, but runtime behavior is unsafe.

export {};

type ProductRecord = {
    id: string;
    title: string;
};

const unsafeProduct = 123 as unknown as ProductRecord;

try {
    console.log(unsafeProduct.title.toUpperCase());
} catch (errorValue) {
    console.log(errorValue instanceof TypeError);
}