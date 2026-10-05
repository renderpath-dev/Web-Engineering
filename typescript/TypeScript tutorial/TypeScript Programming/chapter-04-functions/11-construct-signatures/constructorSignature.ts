// Goal:
// Type a constructor function with a construct signature.

// Expected result:
// The compiler accepts a value that can be called with new

export {};

type ProductInstance = {
    name:string;
};

type ProductConstructor = {
    new (name:string): ProductInstance;
};

class ProductRecord {
    constructor (public name:string) {}
}

function createProduct(ctor: ProductConstructor, name:string):ProductInstance {
    return new ctor(name);
}

console.log(createProduct(ProductRecord,"Keyboard"));