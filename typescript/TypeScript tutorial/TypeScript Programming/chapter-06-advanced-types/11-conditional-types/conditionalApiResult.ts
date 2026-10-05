// Goal:
// Model different API result shapes based on input type.

// Expected result:
// The compiler derives a result shape from the input mode.

export {};

type RequestMode = "list" | "single";

type ProductRecord = {
    id: string;
    title: string;
};

type ApiData<ModeType extends RequestMode> = ModeType extends "list"
    ? ProductRecord[]
    : ProductRecord;

function createMockData<ModeType extends RequestMode>(mode: ModeType): ApiData<ModeType> {
    if (mode === "list") {
        return [{ id: "p1", title: "Keyboard" }] as ApiData<ModeType>;
    }

    return { id: "p1", title: "Keyboard" } as ApiData<ModeType>;
}

const listData = createMockData("list");
const singleData = createMockData("single");

console.log(listData[0]?.title);
console.log(singleData.title);