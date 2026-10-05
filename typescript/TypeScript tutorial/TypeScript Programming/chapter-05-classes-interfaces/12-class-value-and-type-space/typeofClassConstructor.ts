// Goal:
// Use typeof  ClassName to describe the constructor side

// Expected result:
// The compiler accepts class constructors with matching new signatures

export {};

class ProductRecord {
    constructor(public readonly id: string) {}
}

function createRecord(ctor: typeof ProductRecord, id:string): ProductRecord {
    return new ctor(id);
}

const productRecord = createRecord(ProductRecord,"p1");

console.log(productRecord.id);
