// Goal:
// Create a generic class that preserves value type.

// Expected result:
// The compiler infers string for the box content.

export {};

class Box<ValueType> {
  constructor(private value: ValueType) {}

  read(): ValueType {
    return this.value;
  }

  replace(nextValue: ValueType): void {
    this.value = nextValue;
  }
}

const titleBox = new Box("Keyboard");

titleBox.replace("Mouse");

// ts-expect-error: This box stores strings.
//titleBox.replace(123);

console.log(titleBox.read().toUpperCase());
