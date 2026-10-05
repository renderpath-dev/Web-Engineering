// Goal:
// Build objects through a typed factory function

// Expected result:
// The compiler enforces supported payment methods

export { };

interface PaymentProcessor {
    pay(amountValue: number): string;
}

class CardPaymentProcessor implements PaymentProcessor {
    pay(amountValue: number): string {
        return `card:${amountValue}`;
    }
}

class WalletPaymentProcessor implements PaymentProcessor {
    pay(amountValue: number): string {
        return `wallet:${amountValue}`
    }
}

type PaymentMethod = "card" | "wallet";

function createPaymentProcessor(method: PaymentMethod): PaymentProcessor {
    switch (method) {
        case "card":
            return new CardPaymentProcessor();
        case "wallet":
            return new WalletPaymentProcessor();
    }
}

const processor = createPaymentProcessor("card");

console.log(processor.pay(99));

// @ts-expect-error: This payment method is not supported.
createPaymentProcessor("cash");