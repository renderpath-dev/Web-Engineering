// Goal:
// Observe why mutable arrays are risky with subtype relationships.

// Expected result:
// This example shows a runtime pitfall.

export {};

type AnimalRecord = {
    name: string;
};

type DogRecord = AnimalRecord & {
    bark(): void;
};

type CatRecord = AnimalRecord & {
    meow(): void;
};

const dogList: DogRecord[] = [
    {
        name: "Rex",
        bark() {
            console.log("woof");
        },
    },
];

const animalList: AnimalRecord[] = dogList;

animalList.push({
    name: "Misty",
} as CatRecord);

const firstDog = dogList[1];

firstDog?.bark();