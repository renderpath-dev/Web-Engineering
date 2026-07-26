// Goal:
// Use a named tuple return value

// Expected result:
// The compiler preserves tuple positions

export {};

type ParseResult = [success: true, value: number] | [success: false, error: string];

function parseNumber(inputText:string): ParseResult {
    const parsedValue = Number(inputText);

    if(Number.isNaN(parsedValue)) {
        return [false, "Invalid number"]
    }

    return [true, parsedValue]
}

const result = parseNumber("42");

if(result[0]) {
    console.log(result[1].toFixed(0));
} else {
    console.log(result[1].toUpperCase());
}