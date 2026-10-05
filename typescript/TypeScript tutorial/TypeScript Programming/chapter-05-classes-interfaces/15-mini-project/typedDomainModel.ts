// Goal:
// Combine abstract class, concrete classes, factory, and builder.

// Expected result:
// The compiler enforces known discount types and valid order construction.

export {};

interface DiscountStrategy {
    apply(amountValue: number): number;
}

class NoDiscountStrategy implements DiscountStrategy {
    apply(amountValue: number): number {
        return amountValue;
    }
}

class PercentageDiscountStrategy implements DiscountStrategy {
    constructor(private readonly rate: number) {}

    apply(amountValue: number): number {
        return amountValue * (1 - this.rate);
    }
}

type DiscountKind = "none" | "percentage";

function createDiscountStrategy(kind: DiscountKind): DiscountStrategy {
    switch (kind) {
        case "none":
            return new NoDiscountStrategy();
        case "percentage":
            return new PercentageDiscountStrategy(0.1);
    }
}

abstract class OrderLineBase {
    constructor(
        public readonly productId: string,
        public readonly quantity: number,
    ) {}

    abstract calculateSubtotal(): number;
}

class ProductOrderLine extends OrderLineBase {
    constructor(
        productId: string,
        quantity: number,
        private readonly unitPrice: number,
    ) {
        super(productId, quantity);
    }

    calculateSubtotal(): number {
        return this.quantity * this.unitPrice;
    }
}

type OrderPayload = {
    readonly userId: string;
    readonly lineSubtotals: readonly number[];
    readonly totalAmount: number;
};

class OrderBuilder {
    private userIdValue?: string;
    private orderLines: OrderLineBase[] = [];
    private discountStrategy: DiscountStrategy = new NoDiscountStrategy();

    userId(userIdValue: string): this {
        this.userIdValue = userIdValue;
        return this;
    }

    addProduct(productId: string, quantity: number, unitPrice: number): this {
        this.orderLines.push(new ProductOrderLine(productId, quantity, unitPrice));
        return this;
    }

    discount(kind: DiscountKind): this {
        this.discountStrategy = createDiscountStrategy(kind);
        return this;
    }

    build(): OrderPayload {
        if (this.userIdValue === undefined) {
            throw new Error("Missing user id");
        }

        const lineSubtotals = this.orderLines.map((orderLine) => {
            return orderLine.calculateSubtotal();
        });

        const rawTotal = lineSubtotals.reduce((totalValue, subtotalValue) => {
            return totalValue + subtotalValue;
        }, 0);

        return {
            userId: this.userIdValue,
            lineSubtotals,
            totalAmount: this.discountStrategy.apply(rawTotal),
        };
    }
}

const orderPayload = new OrderBuilder()
    .userId("u1")
    .addProduct("p1", 2, 50)
    .discount("percentage")
    .build();

console.log(orderPayload.totalAmount);

// @ts-expect-error: Unknown discount kind.
new OrderBuilder().discount("coupon");