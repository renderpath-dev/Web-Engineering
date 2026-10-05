// Goal:
// Type constructor parameters and initialize fields

// Expected result
// The compiler accepts this file and Node prints the summary

export {}

class InvoiceRecord {
    readonly id: string;
    totalAmount: number;

    constructor(id: string, totalAmount: number) {
        this.id = id;
        this.totalAmount = totalAmount;
    }

    createSummary():string {
        return `${this.id}:${this.totalAmount}`;
    }
}

const invoiceRecord = new InvoiceRecord("inv-1",120);

console.log(invoiceRecord.createSummary());