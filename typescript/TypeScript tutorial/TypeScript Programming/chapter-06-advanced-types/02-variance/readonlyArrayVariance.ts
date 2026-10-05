// Goal:
// Prefer readonly arrays when only reading values.

// Expected result:
// The compiler accepts reading through a wider readonly array

export {};

type AnimalRecord = {
    name: string;
}

type DogRecord = AnimalRecord & {
    bark(): void;
};

const dogs: readonly DogRecord[] = [
    {
        name:"Rex",
        bark() {
            console.log("Woof");
        },
    },
];

const animals: readonly  AnimalRecord[] = dogs;

for (const animal of animals) {
    console.log(animal.name);
}

// @ts-expect-error: A readonly array cannot be mutated
animals.push({name:"Misty"});