// Goal:
// Use extends to inherit fields and methods

// Expected result:
// The compiler accepts this file and Node prints both labels

export {};

class NotificationMessage {
    constructor(public readonly messageText: string) {}

    render():string {
        return this.messageText;
    }
}

class EmailMessage extends NotificationMessage {
    constructor(
        messageText: string,
        public readonly subjectText: string,
    ) {
        super(messageText);
    }

    renderSubject():string {
        return this.subjectText.toUpperCase();
    }
}

const emailMessage = new EmailMessage("Welcome","Account");

console.log(emailMessage.render());
console.log(emailMessage.renderSubject());