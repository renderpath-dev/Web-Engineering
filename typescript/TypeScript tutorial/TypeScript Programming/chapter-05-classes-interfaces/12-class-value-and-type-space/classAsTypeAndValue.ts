// Goal:
// Use a class name as both a value and a type.

// Expected result:
// The compiler accepts this file and Node prints true.

export {};

class ProductRecord {
  constructor(public readonly id: string) {}
}

const productRecord: ProductRecord = new ProductRecord("p1");

console.log(productRecord instanceof ProductRecord);