// Goal:
// Use overloads when different inputs produce difference outputs

// Expected result:
// The compiler infers different return types from different calls

export {};

function parseInputValue(inputValue:string):string[];
function parseInputValue(inputValue:number):number;
function parseInputValue(inputValue:string | number): string[] | number {
    if (typeof inputValue === "string") {
        return inputValue.split(",");
    }

    return inputValue * 2;
}

const parsedList = parseInputValue("a,b,c");
const doubledValue = parseInputValue(10);

console.log(parsedList);
console.log(doubledValue);