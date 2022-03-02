var express = require("express");
var fs = require("fs");

var app = express();

var server = require("http").Server(app);

app.set("view engine", "ejs");
app.use(express.static('public'));

var contractsJson = {};
fs.readFile("contracts.json", 'utf8', (err, data) => {
    if (err) {
        console.error(`File does not exist.`);
        return;
    }
    // console.log(JSON.stringify(JSON.parse(data).contracts));
    contractsJson = JSON.parse(data).contracts;
});

var io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});

app.get("/contracts/", function (req, res) {
    res.render("contract", {contractId: ""});
});

app.get("/contracts/:id", function (req, res) {
    // console.log(JSON.stringify(contractsJson[Number(req.params.id)]))
    
    // If the contract id exceeds the length of the contracts list
    if (Number(req.params.id) >= contractsJson.length) {
        res.render("contract", {contractId: ""});
    }
    else {
        res.render("contract", {contractId: req.params.id, contractJson: JSON.stringify(contractsJson[req.params.id])});
    }
});

var port = 80;
server.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});