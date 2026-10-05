// Goal:
// Extend an interface with additional properties.

// Expected result:
// The compiler accepts the extended shape.

export {};

interface EntityRecord {
  id: string;
}

interface ProductRecord extends EntityRecord {
  title: string;
  price: number;
}

const productRecord: ProductRecord = {
  id: "p1",
  title: "Keyboard",
  price: 99,
};

console.log(productRecord.id);
