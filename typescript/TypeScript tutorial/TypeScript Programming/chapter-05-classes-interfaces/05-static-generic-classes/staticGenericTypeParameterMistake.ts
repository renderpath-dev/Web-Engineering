// Goal:
// Goal:
// Show that static members cannot reference class type parameters.

// Expected result:
// The compiler rejects using ItemType in a static member.

export {};

class Box<ItemType> {
  constructor(public readonly value: ItemType) {}

  // @ts-expect-error: Static members cannot reference class type parameters.
  static defaultValue: ItemType;
}

console.log(typeof Box);
