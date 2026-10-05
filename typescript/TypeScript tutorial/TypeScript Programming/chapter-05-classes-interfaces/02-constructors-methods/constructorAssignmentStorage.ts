// Goal:
// Store constructor input on the instance through this assignment.

// Expected output:
// p1:Keyboard:10

export {};

class ProductRecord {
  readonly id: string;
  title: string;
  private stockCount: number;

  constructor(id: string, title: string, stockCount: number) {
    this.id = id;
    this.title = title;
    this.stockCount = stockCount;
  }

  readLabel(): string {
    return `${this.id}:${this.title}:${this.stockCount}`;
  }
}

const productRecord = new ProductRecord("p1", "Keyboard", 10);

console.log(productRecord.readLabel());
