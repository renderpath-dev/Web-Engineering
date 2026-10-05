// Goal:
// Verify that calling a generator returns a generator object

// Expected result:
// Node prints yielded values step by step

export {};

function* createTaskSequence(): Generator<string, void,unknown> {
    yield "design";
    yield "build";
    yield "test";
}

const taskIterator = createTaskSequence();

console.log(taskIterator.next());
console.log(taskIterator.next());
console.log(taskIterator.next());
console.log(taskIterator.next());