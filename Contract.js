/** The main Contract class that all other contracts inherit. */
class Contract {
    constructor(sender, receiver, transactedItems) {
        this.sender = sender;
        this.receiver = receiver;
        this.transactedItems = transactedItems;
    }
}