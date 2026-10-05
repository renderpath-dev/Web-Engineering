// Goal:
// Connect input element type and output element type

// Expected result:
// The compiler infers number[] as the mapped output

export {}

function mapItems<InputType, OutputType> (
    items: InputType[],
    transformItem:(item:InputType) => OutputType
): OutputType[] {
    return items.map(transformItem);
}

const parsedNumbers = mapItems(["1","2","3"],(textValue)=> {
    return Number.parseInt(textValue,10);
});

console.log(parsedNumbers);



