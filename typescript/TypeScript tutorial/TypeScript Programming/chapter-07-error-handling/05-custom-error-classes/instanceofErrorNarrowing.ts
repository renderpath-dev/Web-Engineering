// Goal:
// Narrow different custom error classes with instanceof

// Expected result:
// Node handles each error class differently

export {};

class ValidationError extends Error {
    override name = "ValidationError";

    constructor(public readonly fieldName:string) {
        super(`Invalid field: ${fieldName}`);
    }
}

class AuthorizationError extends Error {
    override name = "AuthorizationError";

    constructor(public readonly actionName: string) {
        super(`Action not allowed: ${actionName}`);
    }
}

function runAction(actionName:string):void {
    if (actionName === "delete") {
        throw new AuthorizationError(actionName);
    }

    if (actionName.length === 0) {
        throw new ValidationError("actionName");
    }
}

try {
    runAction("delete");
} catch (errorValue) {
    if (errorValue instanceof AuthorizationError) {
        console.log(errorValue.actionName);
    } else if (errorValue instanceof ValidationError) {
        console.log(errorValue.fieldName);
    } else {
        throw errorValue;
    }
}