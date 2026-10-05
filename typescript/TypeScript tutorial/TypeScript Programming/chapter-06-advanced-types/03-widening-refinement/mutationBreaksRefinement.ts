// Goal:
// Show that TypeScript doesn't fully track mutation hidden inside another function.

// Expected result:
// The compiler accepts this file, but runtime can still fail

export {};

type ProductDraft = {
    title?: string;
};

function clearTitle(draft: ProductDraft): void {
    delete draft.title;
}

function renderDraft(draft: ProductDraft):string {
    if (draft.title !== undefined) {
        clearTitle(draft);
    }

    return "missing";
}

try {
    console.log(renderDraft({title: "keyboard"}));
} catch (errorValue) {
    console.log(errorValue instanceof TypeError);
}