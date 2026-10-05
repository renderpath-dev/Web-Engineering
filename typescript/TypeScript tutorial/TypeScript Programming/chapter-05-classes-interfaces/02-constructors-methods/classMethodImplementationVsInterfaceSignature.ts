// Goal:
// Distinguish interface method signatures from class method implementations.

// Expected output:
// {"id":"p1"}

export {};

interface SerializableRecord {
  serialize(): string;
}

class ProductRecord implements SerializableRecord {
  constructor(public readonly id: string) {}

  serialize(): string {
    return JSON.stringify({ id: this.id });
  }
}

const productRecord = new ProductRecord("p1");

console.log(productRecord.serialize());
