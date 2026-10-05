// Goal:
// Show that a clas method can lose its this context

// Expected result:
// Node may throw when calling the detached method

export { };

class NameReader {
    nameText = "NameReader";

    readName(): string {
        return this.nameText;
    }
}

const nameReader = new NameReader();
const detachedReadName = nameReader.readName;

try {
    console.log(detachedReadName());
} catch (errorValue) {
    console.log(errorValue instanceof TypeError);
}