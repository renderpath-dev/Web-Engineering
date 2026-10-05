// Goal:
// Use parameter properties to create and initialize fields

// Expected result
// The compiler accepts this file amd Node prints the title

export {};

class ProductRecord {
    constructor(
        public readonly id: string,
        public title: string,
        private stockCount: number,
    ) {}

    hasStock(): boolean {
        return this.stockCount > 0;
    }
}

const productRecord = new ProductRecord ("p1","keyboard",10);

console.log(productRecord.title);
console.log(productRecord.hasStock());