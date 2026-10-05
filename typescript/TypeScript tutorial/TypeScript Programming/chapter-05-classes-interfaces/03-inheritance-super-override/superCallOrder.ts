// Goal:
// Verify that super must run before using this in a derived constructor.

// Expected result:
// The compiler rejects this access before super.

export {};

class BaseRecord {
  id = "base";
}

class DerivedRecord extends BaseRecord {
  constructor() {
    // @ts-expect-error: super must be called before accessing this.
    console.log(this.id);

    super();
  }
}

console.log(typeof DerivedRecord);
