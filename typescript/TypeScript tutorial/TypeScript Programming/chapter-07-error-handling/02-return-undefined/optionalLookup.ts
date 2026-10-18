// Goal:
// Return undefined for a cache miss.

// Expected result:
// The compiler requires undefined checking.

export {};

type CacheRecord = {
    key: string;
    value: string;
};

const cacheMap = new Map<string, CacheRecord>();

cacheMap.set("theme", {
    key: "theme",
    value: "dark",
});

function readCacheRecord(key: string): CacheRecord | undefined {
    return cacheMap.get(key);
}

const cacheRecord = readCacheRecord("missing");

if (cacheRecord !== undefined) {
    console.log(cacheRecord.value);
} else {
    console.log("cache-miss");
}