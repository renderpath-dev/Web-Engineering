// Goal:
// understand function parameter compatibility under strictFunctionTypes

// Expected result:
// The compiler rejects an unsafe callback assignment

export {};

type AnimalRecord = {
    name: string;
};

type DogRecord = AnimalRecord & {
    bark(): void;
};

type AnimalHandler = (animal: AnimalRecord) => void;
type DogHandler = (dog: DogRecord) => void;

const dogOnlyHandler: DogHandler = (dog) => {
    dog.bark();
};

// @ts-expect-error: A dog-only handler cannot safely handle every animal.
const unsafeAnimalHandler: AnimalHandler = dogOnlyHandler;

console.log(typeof unsafeAnimalHandler);



