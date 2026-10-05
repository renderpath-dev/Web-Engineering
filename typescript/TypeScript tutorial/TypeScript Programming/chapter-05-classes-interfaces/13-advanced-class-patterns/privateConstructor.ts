// Goal:
// Use a private constructor to control instance creation

// Expected result:
// The compiler rejects direct construction

export {};

class AppConfig {
    private constructor(
        public readonly environmentName: string,
    ) {}

    static createProduction():AppConfig {
        return new AppConfig("production")
    }
}

const productionConfig = AppConfig.createProduction();

//@ts-expect-error: The constructor is private
const brokenConfig = new AppConfig("development");

console.log(productionConfig.environmentName);
console.log(typeof brokenConfig);

