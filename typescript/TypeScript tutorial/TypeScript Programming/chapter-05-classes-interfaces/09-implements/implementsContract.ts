// Goal:
// Use implements to check that a class satisfies an interface

// Expected result:
// The compiler accepts the correct implementation

export {};

interface SerializableRecord {
    serialize():string;
}

class ProductRecord implements SerializableRecord {
    constructor (
        public readonly id: string,
        public title: string,
    ){}

    serialize(): string {
        return JSON.stringify({
            id: this.id,
            title:this.title,
        });
    }
}

const productRecord = new ProductRecord("p1","Keyboard");

console.log(productRecord.serialize());