// Goal:
// Model UI request states with a discriminated union.

// Expected result:
// The compiler narrows each branch by the status field.

export {};

type IdleState = {
    status: "idle";
};

type LoadingState = {
    status: "loading";
};

type SuccessState = {
    status: "success";
    data: string[];
};

type ErrorState = {
    status: "error";
    message: string;
};

type RequestState = IdleState | LoadingState | SuccessState | ErrorState;

function renderRequestState(state: RequestState): string {
    switch (state.status) {
        case "idle":
            return "Idle";
        case "loading":
            return "Loading";
        case "success":
            return state.data.join(",");
        case "error":
            return state.message;
    }
}

console.log(renderRequestState({ status: "success", data: ["a", "b"] }));