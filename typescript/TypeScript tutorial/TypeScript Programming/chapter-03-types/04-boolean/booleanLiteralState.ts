// Goal:
// Use boolean and boolean literal types for state modeling.

// Expected result:
// The compiler accepts valid states and rejects invalid ones.

export {};

type LoadingState = {
    isLoading: true;
    data:null;
}

type LoadedState = {
    isLoading: false;
    data: string[];
}

type RequestState = LoadingState | LoadedState;

function renderState(state:RequestState) : string {
    if (state.isLoading) {
        return "Loading";
    }
    return state.data.join(",");
}

console.log(renderState({isLoading: true, data:null}));
console.log(renderState({isLoading: false, data:["a", "b", "c"]}));