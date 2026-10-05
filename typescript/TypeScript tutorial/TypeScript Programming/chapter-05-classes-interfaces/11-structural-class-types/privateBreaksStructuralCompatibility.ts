// Goal:
// Show that private members affect class compatibility.

// Expected result:
// The compiler rejects assignment between classes with separate private declarations.

export {};

class UserSecret {
  private secret = "user";
}

class AdminSecret {
  private secret = "admin";
}

// @ts-expect-error: Separate private members make these classes incompatible.
const userSecret: UserSecret = new AdminSecret();

console.log(typeof userSecret);
