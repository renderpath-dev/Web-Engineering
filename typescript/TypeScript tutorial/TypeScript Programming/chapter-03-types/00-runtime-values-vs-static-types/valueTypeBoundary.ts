// Goal:
// Distinguish runtime values from static types.

// Expected result:
// The compiler accepts this file and Node prints the two values.
export {};

type ProductRecord = {
  id: string;
  price: number;
};

const productRecord: ProductRecord = {
  id: "keyboard",
  price: 99,
};

console.log(productRecord.id);
console.log(productRecord.price + 1);