// Goal:
// Use a static factory method on the class constructor object

class UserAccount {
    private constructor (
        public readonly id: string,
        public readonly email: string,
    ) {}

    static createGuest(id:string): UserAccount {
        return new UserAccount(id,`${id}@exampple.com`);
    }
}

const guestAccount = UserAccount.createGuest("guest-1");

console.log(guestAccount.email);