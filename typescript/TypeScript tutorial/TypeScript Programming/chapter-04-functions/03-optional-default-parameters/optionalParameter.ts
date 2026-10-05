// Goal:
// Verify that an optional parameter may be undefined.


// Expected result:
// The compiler accepts this file and Node prints both labels

export {};

function createPageLabel(pageTitle:string, sectionTitle?:string): string {
    if (sectionTitle === undefined) {
        return pageTitle;
    }

    return `${pageTitle} - ${sectionTitle}`
}

console.log(createPageLabel("Setting"));
console.log(createPageLabel("Settings","Security"));