// Goal:
// Safely pair runtime prototype extension with global type augmentation.

// Expected result:
// The compiler accepts the new method and Node prints the last item.

export {};

declare global {
    interface Array<T> {
        lastOrUndefined(): T | undefined;
    }
}

if (!Array.prototype.lastOrUndefined) {
    Array.prototype.lastOrUndefined = function <T>(this: T[]): T | undefined {
        return this[this.length - 1];
    };
}

const itemList = ["a", "b", "c"];

console.log(itemList.lastOrUndefined());