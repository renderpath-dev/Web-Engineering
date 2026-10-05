// Goal:
// Use an abstract class when subclass share implemntation

// Expected result
// The compiler rejects direct instantiation and accepts concrete subclass

export {};

abstract class DataParser {
    parse(inputText:string): unknown {
        const trimedText = inputText.trim();
        return this.parseTrimed(trimedText);
    }

    protected abstract parseTrimed(inputText: string):unknown;
}

class JsonParser extends DataParser {
    protected override parseTrimed(inputText: string): unknown {
        return JSON.parse(inputText);
    }
}

// @ts-expect-error: Cannot instantiate an abstract class
const brokenParser = new DataParser();

const jsonParser = new JsonParser();

console.log(jsonParser.parse('{"Ok":true}'));
console.log(typeof brokenParser);