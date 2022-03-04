var express = require("express");
var fs = require("fs");
// const { WogCoin, TransactedItem } = require("./TransactedItem");

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