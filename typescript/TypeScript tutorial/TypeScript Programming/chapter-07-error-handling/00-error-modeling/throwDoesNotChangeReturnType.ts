// Goal:
// Show that throw does not appear in the normal type

export {};

function readRequiredTitle(titleText: string | undefined): string {
    if (titleText === undefined) {
        throw new Error("Missing title");
    }

    return titleText;
}

const titleText = readRequiredTitle("Keyboard");

console.log(titleText.toUpperCase());

try {
    readRequiredTitle(undefined);
} catch (errorValue) {
    if (errorValue instanceof Error) {
        console.log(errorValue.message);
    }
}