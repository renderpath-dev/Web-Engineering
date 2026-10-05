// Goal:
// Show that the implementation signature is not directly callable

// Expected result:
// The compiler infers different return types from different calls

export { };

function createDate(timestampValue: number): Date;
function createDate(yearValue: number, monthValue: number, dayValue: number): Date;
function createDate(yearOrTimestamp: number, monthValue?: number, dayValue?: number): Date {
    if (monthValue !== undefined && dayValue !== undefined) {
        return new Date(yearOrTimestamp, monthValue, dayValue);
    }
    return new Date(yearOrTimestamp);
}

console.log(createDate(1700000000000));
console.log(createDate(2026,4,15));

// @ts-expect-error: No overload accepts exactly two arguments
console.log(createDate(2026,4));