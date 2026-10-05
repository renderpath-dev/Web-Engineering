//Goal:
// Build a typed two-step pipline

// Expected result
// The output type is inferred from the second type

export {};

type Step<InputType, OutputType> = (inputValue: InputType) => OutputType;

function pipeTwoSteps<InputType, MiddleType, OutputType> (
    inputValue: InputType,
    firstStep: Step<InputType, MiddleType>,
    secondStep: Step<MiddleType, OutputType>,
): OutputType {
    return secondStep(firstStep(inputValue));
}


const finalLabel = pipeTwoSteps(
    "42",
    (inputText) => Number.parseInt(inputText,20),
    (numberValue) => `quantity: ${numberValue}`,
);

console.log(finalLabel.toUpperCase());

//@ts-expect-error finalLabel is a string, not a number.
console.log(finalLabel.toFixed(2));