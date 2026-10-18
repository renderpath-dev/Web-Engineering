// Goal:
// Compare nullable value handling and Option handling

// Expected result:
// The compiler accepts explicit option handing

export {};

type Option<ValueType> =
    | {kind:"some"; value:ValueType}
    | {kind:"none"};
