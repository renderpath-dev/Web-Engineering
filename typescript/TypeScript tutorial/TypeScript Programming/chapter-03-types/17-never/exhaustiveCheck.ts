// Goal:
// Use never to enforce exhaustive checks

// Expected result:
// The compiler accepts this file only when every state is handled

export {};

type RequestState =
    | {status: "idle"}
    | {status: "loading"}
    | {status: "success"; data: string[]}
    | {status: "error"; message: string};

function assertNever(value: never) : never {
    throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

function renderState(state: RequestState) : string {
    switch(state.status) {
        case "idle":
            return"idle";
            case "loading":
                return "loading";
                case "success":
                    return state.data.join(",")
                    case "error":
                        return state.message;
                        default:
                            return assertNever(state);
    }
}

console.log(renderState({status: "idle"}));



