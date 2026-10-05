// GoaL:
// Type a function value that also owns metadata

// Expected result:
// The compiler accepts this file

export {};

type ValidatorFunction = {
    ruleName: string;
    (inputValue:string):boolean;
};

const nonEmptyValidator: ValidatorFunction = Object.assign(
    (inputValue:string)=> {
        return inputValue.trim().length>0;
    },
    {
        ruleName:"non-empty",
    },
);

console.log(nonEmptyValidator('hello'));
console.log(nonEmptyValidator.ruleName);