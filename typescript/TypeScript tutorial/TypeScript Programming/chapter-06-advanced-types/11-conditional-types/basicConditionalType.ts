// Goal:
// Use a conditional type to choose a result type.

// Expected result:
// The compiler computes different result types.

export {};

type LabelFor<ValueType> = ValueType extends number
    ? { id: number }
    : { name: string };

const idLabel: LabelFor<number> = {
    id: 1,
};

const nameLabel: LabelFor<string> = {
    name: "Keyboard",
};

console.log(idLabel.id);
console.log(nameLabel.name);