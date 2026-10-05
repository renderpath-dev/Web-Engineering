// Goal:
// Declare a generic parameter on an interface-like object type

// Expected result:
// The compiler accepts a strongly typed store

export {};

type Store<ItemType> = {
    items: ItemType[];
    add(item: ItemType):void;
    getAll(): ItemType[];
};


const numberStore: Store<number> = {
    items:[2,4,6,8],
    add(item) {
        this.items.push(item);
    },
    getAll() {
        return this.items;
    },
};


numberStore.add(10);
const numberList = numberStore.items.map((item,index)=> {
    return `${index}:${item.toFixed()}`;
})
console.log(numberList);
// @ts-expect-error: The store only accepts numbers.
numberStore.add("10");

console.log(numberStore.getAll());
