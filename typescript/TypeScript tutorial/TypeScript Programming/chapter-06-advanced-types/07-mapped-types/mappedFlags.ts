// Goal:
// Map every property to a boolean flag

// Expected result:
// The compiler derives a flag object from the source type

export {};

type FeaturedHandlers = {
    search():void;
    checkout():void;
    profile():void;
};

type FeatureFlags<SourceType> = {
    [KeyName in keyof SourceType]:boolean;
}

const featureFlags: FeatureFlags<FeaturedHandlers> = {
    search: true,
    checkout: false,
    profile: true,
};

console.log(featureFlags.search);