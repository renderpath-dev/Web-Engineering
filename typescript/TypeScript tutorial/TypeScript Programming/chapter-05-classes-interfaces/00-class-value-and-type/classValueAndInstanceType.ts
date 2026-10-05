// Distinguish a class runtime value from its instance type

// Expected result:
// The compiler accepts this file and Node prints the product title

export {};

class ProductRecord {
    constructor (
        public readonly id: string,
        public title: string,
    ) {}
}

const productRecord: ProductRecord = new ProductRecord("p1","keyboard");
console.log(typeof ProductRecord);
console.log(productRecord.title);