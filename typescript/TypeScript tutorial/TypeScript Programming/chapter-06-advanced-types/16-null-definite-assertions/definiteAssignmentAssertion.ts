// Goal:
// Use definite assignment assertion only when external setup guarantees assignment.

// Expected result:
// The compiler accepts the field but runtime still depends on setup.

export {};

class ConfigStore {
    value!: string;

    initialize(value: string): void {
        this.value = value;
    }

    readUppercase(): string {
        return this.value.toUpperCase();
    }
}

const configStore = new ConfigStore();

configStore.initialize("ready");

console.log(configStore.readUppercase());