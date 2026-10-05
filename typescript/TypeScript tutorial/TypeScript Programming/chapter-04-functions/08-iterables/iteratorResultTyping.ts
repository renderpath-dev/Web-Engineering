// Goal:
// Observe IteratorResult typing

// Expected result:
// The compiler accepts safte handling of done

export {};

const statusIterator = ["draft","published"] [Symbol.iterator]();

const firstResult = statusIterator.next();

if (!firstResult.done) {
    const statusText:string=firstResult.value;
    console.log(statusText);
}