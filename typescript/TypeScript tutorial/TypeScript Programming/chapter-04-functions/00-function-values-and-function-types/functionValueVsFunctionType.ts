// Goal:
// Distinguish a runtime function value from a static function type

// Expected result:
// The compiler accepts this file and Node prints the formatted title

export {};

type TitleFormatter = (titleText: string) => string;

const formatProductTitle: TitleFormatter = (titleText) => {
    return titleText.trim().toUpperCase();
};

console.log(formatProductTitle("keyboard"));