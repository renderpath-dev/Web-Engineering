// Goal:
// Use never to enforce exhaustive switch handling.

// Expected result:
// The compiler accepts the exhaustive switch.

export {};

type RequestState =
    | { kind: "idle" }
    | { kind: "loading" }
    | { kind: "success"; data: string[] }
    | { kind: "error"; message: string };

function renderState(state: RequestState): string {
    switch (state.kind) {
        case "idle":
            return "Idle";
        case "loading":
            return "Loading";
        case "success":
            return state.data.join(",");
        case "error":
            return state.message;
        default: {
            const exhaustiveValue: never = state;
            return exhaustiveValue;
        }
    }
}

console.log(renderState({ kind: "success", data: ["a", "b"] }));