// Goal:
// Initialize class fields in field declarations and constructors.

// Expected result:
// The compiler accepts this file and Node prints the account label.

export {};

class AccountRecord {
  status = "active";
  displayName: string;

  constructor(displayName: string) {
    this.displayName = displayName;
  }

  createLabel(): string {
    return `${this.displayName}:${this.status}`;
  }
}

const accountRecord = new AccountRecord("Ada");

console.log(accountRecord.createLabel());
