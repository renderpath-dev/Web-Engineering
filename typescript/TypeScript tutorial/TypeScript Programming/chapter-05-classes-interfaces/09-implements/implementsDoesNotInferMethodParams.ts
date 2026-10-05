// Goal:
// Show that implements does not infer method parameter types inside the class body.

// Expected result:
// With noImplicitAny enabled, the compiler rejects the untyped parameter.

export {};

interface NameChecker {
  check(nameText: string): boolean;
}

class BrokenNameChecker implements NameChecker {
  // @ts-expect-error: The parameter type is not inferred from implements.
  check(nameText) {
    return nameText.toLowerCase() === "ok";
  }
}

console.log(typeof BrokenNameChecker);
