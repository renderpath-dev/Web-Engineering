// Goal:
// Expand parameter properties into explicit fields and assignments.

// Expected output:
// p1
// true
// p2
// true

export {};

class ExplicitProductRecord {
  public readonly id: string;
  public title: string;
  private stockCount: number;

  constructor(id: string, title: string, stockCount: number) {
    this.id = id;
    this.title = title;
    this.stockCount = stockCount;
  }

  hasStock(): boolean {
    return this.stockCount > 0;
  }
}

class ShorthandProductRecord {
  constructor(
    public readonly id: string,
    public title: string,
    private stockCount: number,
  ) {}

  hasStock(): boolean {
    return this.stockCount > 0;
  }
}

const explicitProduct = new ExplicitProductRecord("p1", "Keyboard", 10);
const shorthandProduct = new ShorthandProductRecord("p2", "Mouse", 5);

console.log(explicitProduct.id);
console.log(explicitProduct.hasStock());
console.log(shorthandProduct.id);
console.log(shorthandProduct.hasStock());
