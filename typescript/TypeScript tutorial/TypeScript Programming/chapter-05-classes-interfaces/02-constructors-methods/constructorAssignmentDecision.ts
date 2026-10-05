// Goal:
// Decide which constructor values should become instance fields.

// Expected output:
// s1
// 3500
// closed
// true

export {};

class CheckoutSession {
  readonly sessionId: string;
  readonly createdAt = new Date();
  status: "open" | "closed" = "open";
  totalCents: number;

  constructor(sessionId: string, itemPrices: readonly number[]) {
    const computedTotal = itemPrices.reduce((totalValue, priceValue) => {
      return totalValue + priceValue;
    }, 0);

    this.sessionId = sessionId;
    this.totalCents = computedTotal;
  }

  close(): void {
    this.status = "closed";
  }
}

const session = new CheckoutSession("s1", [1000, 2500]);

session.close();

console.log(session.sessionId);
console.log(session.totalCents);
console.log(session.status);
console.log(session.createdAt instanceof Date);
