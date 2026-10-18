// Goal:
// Create a domain-specific Error subclass

// Expected result:
// Node prints the custom error name and field

export {};

class MissingFieldError extends Error {
    override name = "MissingFieldError";

    constructor (public readonly fieldName:string) {
        super(`Missing Field: ${fieldName}`);
    }
}

function requireField(record: Record<string, unknown>, fieldName:string):unknown {
    if (!(fieldName in record)) {
        throw new MissingFieldError(fieldName);
    }

    return record[fieldName];
}

try {
    requireField({title:"Keyboard"},"price");
} catch (errorValue) {
    if(errorValue instanceof MissingFieldError) {
        console.log(errorValue.name);
        console.log(errorValue.fieldName);
    }
}
