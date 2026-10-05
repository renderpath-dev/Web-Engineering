// Goal:
// Remove readonly and optional modifiers in a mapped type.

// Expected result:
// The compiler requires all mutable properties.

export {};

type DraftProduct = {
    readonly id?: string;
    readonly title?: string;
};

type CompleteMutable<SourceType> = {
    -readonly [KeyName in keyof SourceType]-?: SourceType[KeyName];
};

const completeProduct: CompleteMutable<DraftProduct> = {
    id: "p1",
    title: "Keyboard",
};

completeProduct.title = "Mouse";

console.log(completeProduct.title);