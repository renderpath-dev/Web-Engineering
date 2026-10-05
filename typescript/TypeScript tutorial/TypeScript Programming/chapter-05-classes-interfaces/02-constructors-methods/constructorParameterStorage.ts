// Goal:
// Show that constructor parameters are not stored on the instance automatically.

// Expected result:
// The compiler rejects reading this.title.

export {};

class BrokenProductRecord {
  constructor(title: string) {
    console.log(title);
  }

  readTitle(): string {
    // @ts-expect-error: The class has no title field.
    return this.title;
  }
}

const productRecord = new BrokenProductRecord("Keyboard");

console.log(productRecord.readTitle());
