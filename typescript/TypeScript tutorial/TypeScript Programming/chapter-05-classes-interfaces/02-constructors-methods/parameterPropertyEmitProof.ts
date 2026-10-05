// Goal:
// Prove that a parameter property creates an own instance field.

// Expected output:
// true
// true
// false
// Mouse

export {};

class ExplicitProductRecord {
  public title: string;

  constructor(title: string) {
    this.title = title;
  }
}

class ParameterPropertyProductRecord {
  constructor(public title: string) {}
}

class PlainParameterProductRecord {
  constructor(title: string) {
    console.log(title.length > 0);
  }
}

const explicitProduct = new ExplicitProductRecord("Keyboard");
const parameterProduct = new ParameterPropertyProductRecord("Mouse");
const plainProduct = new PlainParameterProductRecord("Monitor");

console.log(Object.hasOwn(explicitProduct, "title"));
console.log(Object.hasOwn(parameterProduct, "title"));
console.log(Object.hasOwn(plainProduct, "title"));
console.log(parameterProduct.title);
