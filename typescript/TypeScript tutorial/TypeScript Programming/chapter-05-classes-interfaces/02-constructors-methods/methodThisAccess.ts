// Goal:
// Use this to access instance fields inside class methods

// Expected result:
// The compiler accepts this file and Node prints the updated stock

export {};

class InventoryItem {
    constructor (
        public readonly sku: string,
        private stockCount: number,
    ) {}

    addStock(amountValue: number):void {
        this.stockCount += amountValue;
    }

    readStock():number {
        return this.stockCount;
    }
}

const inventoryItem = new InventoryItem("kb-1",5)