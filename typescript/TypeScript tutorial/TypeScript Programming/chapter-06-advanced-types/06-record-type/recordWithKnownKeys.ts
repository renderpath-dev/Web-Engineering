// Goal:
// User Record with a known key union

// Expected result:
// The compiler requires all known keys

export {};

type FeatureName = "search" | "checkout" | "profile";

type FeatureConfig = {
    enabled: boolean;
}

const featureConfigMap: Record<FeatureName, FeatureConfig> = {
    search: {enabled: true},
    checkout: {enabled: false},
    profile: {enabled: true},
};

console.log(featureConfigMap.search.enabled);

//@ts-expect-error: reports is not a known feature key
featureConfigMap.reports = {enabled: true};