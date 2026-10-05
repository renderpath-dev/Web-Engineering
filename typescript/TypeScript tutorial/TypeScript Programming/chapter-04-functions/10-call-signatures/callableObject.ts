// Goal:
// Use a call signature to type a callable object

// Expected result:
// The compiler accepts the callable object

export {};

type TrackedFormatter = {
    description: string;
    callCount: number;
    (inputText:string):string;
};

const trackedFormatter: TrackedFormatter = Object.assign(
    (inpuText: string)=> {
        trackedFormatter.callCount+=1;
        return inpuText.trim().toUpperCase();
    },
    {
        description: "Uppercase formatter",
        callCount: 0,
    },
);

console.log(trackedFormatter("keyboard"));
console.log(trackedFormatter.description);
console.log(trackedFormatter.callCount);