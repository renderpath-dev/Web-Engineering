export {};

const tagList: Array<string | number> = ["typescript", "functional"];

tagList.push("types");
tagList.push(123);

const upperTagList = tagList.map((tagValue) => {
    if (typeof tagValue === "string") {
        return tagValue.toUpperCase();
    }

    return String(tagValue);
});

console.log(upperTagList);