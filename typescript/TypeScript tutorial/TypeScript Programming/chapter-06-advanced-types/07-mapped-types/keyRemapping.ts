// Goal:
// Remap keys with template literal types.

// Expected result:
// The compiler requires remapped getter names.

export {};

type ProductRecord = {
    id: string;
    title: string;
    price: number;
};

type GetterMap<SourceType> = {
    [KeyName in keyof SourceType as `get${Capitalize<string & KeyName>}`]: () => SourceType[KeyName];
};

const productGetters: GetterMap<ProductRecord> = {
    getId: () => "p1",
    getTitle: () => "Keyboard",
    getPrice: () => 99,
};

console.log(productGetters.getTitle());