// Goal:
// Compare public, protected, and private access

// Expected result:
// The compiler rejects invalid access

export {};

class AccountBase {
    public displayName = "Ada";
    protected roleName = "member";
    private secretToken = "token";

    readTokenInsideBase():string {
        return this.secretToken;
    }
}

class AdminAccount extends AccountBase {
    readRole():string {
        return this.roleName;
    }
}

const adminAccount = new AdminAccount();

console.log(adminAccount.displayName);
console.log(adminAccount.readRole());

// @ts-expect-error:protected member is not accessible outside the class hierachy
console.log(adminAccount.roleName);

// @ts-expect-errorL private member is only accessible inside AccountBase.
console.log(adminAccount.secretToken);

