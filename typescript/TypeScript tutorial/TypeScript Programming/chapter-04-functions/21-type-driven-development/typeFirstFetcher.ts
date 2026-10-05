// GOAL:
// MODEL a fetch helper result before writing the implementation

import { create } from "node:domain";

// Expected result:
// The compiler force callers to handle both result states

export {};

type FetchResult <DataType> = 
| {
    ok: true;
    data: DataType;
}
| {
    ok: false;
    errorMessage: string;
};

type ProductRecrod = {
    id: string;
    title: string;
};

function createMockProductResult(shouldSucceed: boolean): FetchResult<ProductRecrod> {
    if (!shouldSucceed) {
        return {
            ok: false,
            errorMessage: "Request failed",
        };
    }

    return {
        ok: true,
        data: {
            id: "p1",
            title: "keyboard"
        },
    };
}

const result = createMockProductResult(true);

if (result.ok) {
    console.log(result.data.title)
} else {
    console.log(result.errorMessage)
}