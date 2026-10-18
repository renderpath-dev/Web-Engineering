// Goal:
// Transform a successful Result value while preserving the error type.

// Expected result:
// The compiler preserves success and failure types.

export {};

type Result<ValueType, ErrorType> =
    | { ok: true; value: ValueType }
    | { ok: false; error: ErrorType };

function mapResult<InputType, OutputType, ErrorType>(
    result: Result<InputType, ErrorType>,
    transformValue: (value: InputType) => OutputType,
): Result<OutputType, ErrorType> {
    if (!result.ok) {
        return result;
    }

    return {
        ok: true,
        value: transformValue(result.value),
    };
}

const numberResult: Result<number, string> = {
    ok: true,
    value: 42,
};

const labelResult = mapResult(numberResult, (value) => `value:${value}`);

console.log(labelResult);