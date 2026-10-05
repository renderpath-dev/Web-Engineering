// Goal:
// Use an arrow method property to capture instance this.

// Expected result:
// Node prints the instance name even after detaching the function

export {};

class StableNameReader {
    nameText = "StableNameReader";

    readName = (): string => {
        return this.nameText;
    };
}

const stableNameReader = new StableNameReader();
const detachedReadName = stableNameReader.readName;

console.log(detachedReadName());