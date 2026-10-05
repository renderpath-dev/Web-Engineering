// Goal:
// Create a generic function type alias.

// Expected result:
// The compiler accepts a typed mapper

export {};

type Mapper<InputType, OutputType> = (inputValue: InputType) => OutputType;

const titleLengthMapper: Mapper<string, number> = (inputValue)=> {
    return inputValue.length;
};

console.log(titleLengthMapper("keyboard"));