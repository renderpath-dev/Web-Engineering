// Goal:
// Separate a conditional type from a runtime branch.

// Expected result:
// The compiler computes the type, and runtime code still uses an if statement.

export {};

type ResponseShape<IsListType extends boolean> = IsListType extends true
    ? string[]
    : string;

function createResponse<IsListType extends boolean>(
    isList: IsListType,
): ResponseShape<IsListType> {
    if (isList) {
        return ["keyboard", "mouse"] as ResponseShape<IsListType>;
    }

    return "keyboard" as ResponseShape<IsListType>;
}

const listResponse = createResponse(true);
const singleResponse = createResponse(false);

console.log(listResponse.join(","));
console.log(singleResponse.toUpperCase());