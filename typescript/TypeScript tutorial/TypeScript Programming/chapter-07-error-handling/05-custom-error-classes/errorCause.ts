// Goal:
// Wrap a lower-level error with a higher-level cause.

// Expected result:
// Node prints the wrapper message and confirms the cause.

export {};

class ConfigParseError extends Error {
    override name = "ConfigParseError";

    constructor(messageText: string, causeValue: unknown) {
        super(messageText, { cause: causeValue });
    }
}

function parseConfig(configText: string): unknown {
    try {
        return JSON.parse(configText);
    } catch (errorValue) {
        throw new ConfigParseError("Config could not be parsed", errorValue);
    }
}

try {
    parseConfig("{broken-json");
} catch (errorValue) {
    if (errorValue instanceof ConfigParseError) {
        console.log(errorValue.message);
        console.log(errorValue.cause instanceof SyntaxError);
    }
}