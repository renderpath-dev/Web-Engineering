// Goal:
// Model presence and absence with option

// Expected result:
// The compiler narrows Some and None branches

export {};

type Option<ValueType> =
    | {kind:"some"; value:ValueType}
    | {kind:"none"};

function findFirstLongTitle(titleList:string[]):Option<string> {
    const title = titleList.find((item)=> item.length>6);

    if (title === undefined) {
        return {kind:"none"}
    }

    return {kind:"some",value:title};
}

const result = findFirstLongTitle(["Mouse","Keyboard"]);


if (result.kind === "some") {
    console.log(result.value.toUpperCase());
} else {
    console.log('none');
}