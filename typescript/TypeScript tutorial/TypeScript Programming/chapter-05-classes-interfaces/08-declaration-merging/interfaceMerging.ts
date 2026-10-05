// Goal:
// Verify that same-name interfaces merge members

// Expected result:
// The compiler requires both merged properties

export {};

interface AppConfig {
    appName: string;
}

interface AppConfig {
    version: string;
}

const appConfig: AppConfig = {
    appName: "Learning Lab",
    version: "1.0.0",
}

console.log(`${appConfig.appName}:${appConfig.version}`);