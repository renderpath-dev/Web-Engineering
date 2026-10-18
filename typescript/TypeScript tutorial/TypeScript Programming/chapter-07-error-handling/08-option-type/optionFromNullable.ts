// Goal:
// Convert nullable values into Option values

// Expected result:
// The compiler handles the option branches

export {};

type Option<ValueType> =
    | {kind:"none"}
    | {kind: "some"; value: ValueType};

function fromNullable<ValueType>(value: ValueType | null | undefined):Option<NonNullable<ValueType>> {
    if (value === null || value === undefined) {
        return {kind: "none"};
    }

    return {kind:"some", value: value as NonNullable<ValueType>};
}

const optionValue = fromNullable("Keyboard");


if (optionValue.kind === "some") {
    console.log(optionValue.value.toUpperCase());
}