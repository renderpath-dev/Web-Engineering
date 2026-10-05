// Goal:
// Show how intersection can produce impossible property requirements

// Expected result:
// The compiler rejects assigning a string to a never property

export {};

type NamedAsString = {
    name: string;
};

type NamedAsNumber = {
    name: number;
};

type ImpossibleName = NamedAsString & NamedAsNumber;

const impossibleName: ImpossibleName = {
    //@ts-expect-error
    name:"Ada",
};

console.log(typeof impossibleName);