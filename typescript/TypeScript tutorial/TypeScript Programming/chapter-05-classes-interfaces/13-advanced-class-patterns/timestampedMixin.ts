// Goal:
// Add timestamp fields to a base class through a mixin

// Expected result:
// The compiler preserves base members and mixin members

export {};

type Constructor<InstanceType = {}> = new (...args:any[]) => InstanceType;

function Timestamped<BaseType extends Constructor>(BaseClass: BaseType) {
    return class TimestampedClass extends BaseClass {
        createdAt = new Date();

        readCreatedAt():string {
            return this.createdAt.toISOString();
        }
    };
}

class ProductRecord {
    constructor(public readonly title: string) {}
}

const TimestampedProductRecord = Timestamped(ProductRecord);

const productRecord = new TimestampedProductRecord("keyboard");

console.log(productRecord.title);
console.log(productRecord.readCreatedAt());