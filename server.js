var express = require("express");
var fs = require("fs");
const { WogCoin, TransactedItem } = require("./TransactedItem");

var app = express();

var server = require("http").Server(app);

app.set("view engine", "ejs");
app.use(express.static('public'));

// var a = new WogCoin("WogCoin", 2);
// var b = new TransactedItem("Solane", 5);
// console.log(JSON.stringify(a));
// console.log(JSON.stringify(b));

var contractsJson = {};
fs.readFile("contracts.json", 'utf8', (err, data) => {
    if (err) {
        console.error(`File does not exist.`);
        return;
    }
    contractsJson = JSON.parse(data).contracts;
});

var io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});

app.get("/name", function (req, res) {
    res.render("name");
});

app.get("/contracts/", function (req, res) {
    res.render("contract", {contractId: "", contractJson: ""});
});

app.get("/contracts/new", function (req, res) {
    //(TODO): Make two buttons at first that allow the user to choose to either upload a new TransactedItem class or to make a new contract with any of the pre-existing TransactedItem classes.
    //(TODO): Make a page that allows people to upload custom TransactedItem class code to the server.
});

app.get("/contracts/:id", function (req, res) {
    // If the contract id exceeds the length of the contracts list
    if (Number(req.params.id) >= contractsJson.length) {
        res.render("contract", {contractId: "", contractJson: ""});
    }
    else {
        res.render("contract", {contractId: req.params.id, contractJson: JSON.stringify(contractsJson[req.params.id])});
    }
});

//(TODO): Make custom user creatable TransactedItem(s) based on the TransactedItem class.
/** The dictionary of custom TransactedItem(s) classes. */
var customTransactedItems = {
    /* The dictionary key should always be lower-case. */
    // "solane": <The class that can be instanced>
};

function addNewCustomTransactedItemClass(transactedItemName, stringCode) {
    transactedItemName = transactedItemName.toLowerCase();
    if (Object.keys(customTransactedItems).includes(transactedItemName)) return false;
    eval(`customTransactedItems["${transactedItemName}"] = ${stringCode}`);
    return true;
}

// Testing code below, for the addNewCustomTransactedItemClass function
    // console.log(addNewCustomTransactedItemClass("solane", "class Solane extends TransactedItem { constructor(name, amount) { super(name, amount); } }"));
    // console.log(addNewCustomTransactedItemClass("solane", "class Solane extends TransactedItem { constructor(name, amount) { super(name, amount); } }"));
    // console.log(JSON.stringify(new customTransactedItems["solane"]("Solane1", 3)));

//(TODO): Integrate the custom items into the contracts.json file so that it can be viewed properly on the site.

const users = {};

io.on('connection', socket => {
    socket.on('new-user', userDict => {
        users[socket.id] = userDict;
        socket.broadcast.emit('user-connected', userDict["name"]);
        console.log(`${userDict["name"]} connected at ${new Date().toLocaleTimeString()}`);
    });
    socket.on('accept-contract', acceptanceJson => {
        //(TODO): Make it update the contracts.json file with the updated data every time the data is modified.
        switch(acceptanceJson.type) {
            case "sender":
                contractsJson[acceptanceJson.contractId].sAccepted = true;
                socket.broadcast.emit("update-contract-ui", {contractId: acceptanceJson.contractId, contractJson: contractsJson[acceptanceJson.contractId]});
            break;

            case "receiver":
                contractsJson[acceptanceJson.contractId].rAccepted = true;
                socket.broadcast.emit("update-contract-ui", {contractId: acceptanceJson.contractId, contractJson: contractsJson[acceptanceJson.contractId]});
            break;
        }
    });
    socket.on('disconnect', () => {
        if (users[socket.id] == null | undefined) return;
        socket.broadcast.emit('user-disconnected', users[socket.id]["name"]);
        console.log(`${users[socket.id]["name"]} disconnected at ${new Date().toLocaleTimeString()}`);
        delete users[socket.id];
    });
});

var port = 80;
server.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});