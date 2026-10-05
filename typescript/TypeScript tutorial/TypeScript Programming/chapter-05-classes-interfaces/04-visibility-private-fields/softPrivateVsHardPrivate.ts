// Goal:
// Compare TypeScript private and JavaScript private fields.

// Expected result:
// The compiler rejects direct access to both private members.

export {};

class SecretStore {
  private softSecret = "soft";
  #hardSecret = "hard";

  readSecrets(): string {
    return `${this.softSecret}:${this.#hardSecret}`;
  }
}

const secretStore = new SecretStore();

console.log(secretStore.readSecrets());

// @ts-expect-error: softSecret is private in TypeScript.
console.log(secretStore.softSecret);

// @ts-expect-error: hardSecret is a JavaScript private field.
console.log(secretStore.#hardSecret);
