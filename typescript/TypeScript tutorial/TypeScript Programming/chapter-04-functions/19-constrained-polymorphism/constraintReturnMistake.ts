// Goal:
// Understand that returning the constraint is not the same as returning the type parameter.

// Expected result:
// The compiler rejects returning a plain constraint object as ValueType.

export {};

function ensureMinimumLength<ValueType extends { length: number }>(
  value: ValueType,
  minimumLength: number,
): ValueType {
  if (value.length >= minimumLength) {
    return value;
  }

  // @ts-expect-error: This object satisfies the constraint, but it may not be ValueType.
  return { length: minimumLength };
}
