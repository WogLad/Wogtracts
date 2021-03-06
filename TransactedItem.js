/** The main Contract class that all other contracts inherit. */
// class Contract {
//     constructor(sender, receiver, transactedItems) {
//         this.sender = sender;
//         this.receiver = receiver;
//         this.transactedItems = transactedItems;
//     }
// }

/** The main TransactedItem class that all other TransactedItems inherit. */
class TransactedItem {
    constructor(/*name,*/ amount) {
        // this.name = name;
        this.amount = amount;
    }
}

// Test inheritor of the TransactedItem class
// All custom TransactedItems should follow the same standard as displayed in the below class.
class WogCoin extends TransactedItem {
    constructor(amount) {
        super(/*name,*/ amount);
    }
}

class Car extends TransactedItem {
    constructor(amount, brand, color, wheelCount, seatCount) {
        super(amount);
        this.brand = brand;
        this.color = color;
        this.wheelCount = wheelCount;
        this.seatCount = seatCount;
    }
}

module.exports =  {
    TransactedItem,
    WogCoin,
    Car
};