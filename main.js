const express = require('express');
const app = express();
const cfg = require('./config.json');
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const fetch = require("node-fetch");
const Headers = require("node-fetch");
const https = require("https");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

var phones = {}

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

app.get('/phoneAPI/dial', (async (req, res) => {
    if (req.query.number && req.query.ip) {
        var ip = req.query.ip;
        var data = "";

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("readystatechange", function() {
            if(this.readyState === 4) {
                console.log(this.responseText);
            }
        });

        xhr.open("GET", "https://" + ip + "/api/v1/exec/command?action=call&number=" + req.query.number);
        xhr.setRequestHeader("Authorization", "Bearer " + cfg.phones[ip]);

        xhr.send(data);

        res.json({})
    }
}))

app.get('/phoneAPI/accept', (async (req, res) => {
    if (req.query.callID && req.query.ip) {
        var ip = req.query.ip;
        var callID = req.query.callID;
        var data = "";

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("readystatechange", function() {
            if(this.readyState === 4) {
                console.log(this.responseText);
            }
        });

        xhr.open("GET", "https://" + ip + "/api/v1/exec/command?action=accept&callid=" + callID);
        xhr.setRequestHeader("Authorization", "Bearer " + cfg.phones[ip]);

        xhr.send(data);
    }
}))

app.get('/phoneAPI/decline', (async (req, res) => {
    if (req.query.callID && req.query.ip) {
        var ip = req.query.ip;
        var callID = req.query.callID;
        var data = "";

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("readystatechange", function() {
            if(this.readyState === 4) {
                console.log(this.responseText);
            }
        });

        xhr.open("GET", "https://" + ip + "/api/v1/exec/command?action=hangup&callid=" + callID);
        xhr.setRequestHeader("Authorization", "Bearer " + cfg.phones[ip]);

        xhr.send(data);
    }
}))

app.get('/phoneAPI/action', (req, res) => {
    let macAddress = req.query.mac;
    var requestQuery = req.query;
    requestQuery.ip = req.ip;
    requestQuery.ip = requestQuery.ip.split(':')[3];

    if(req.query.event === "incoming"){
        requestQuery.number = requestQuery.number.split('@')[0].split(':')[1];
        io.to(macAddress).emit('incoming', requestQuery)
    }

    if(req.query.event === "disconnected"){
        io.to(macAddress).emit('disconnected', requestQuery)
    }

    if(req.query.event === "connected"){
        io.to(macAddress).emit('connected', requestQuery)
    }

    if(req.query.event === "outgoing"){
        requestQuery.number = requestQuery.number.split('@')[0].split(':')[1];
        io.to(macAddress).emit('outgoing', requestQuery)
    }

    console.log(requestQuery);


    res.json({'success': true})
});

app.get('/', ((req, res) => {
    res.sendFile(__dirname + '/html/index.html');
}))

app.get('/client', ((req, res) => {
    res.sendFile(__dirname + '/html/client.html');
}))

io.on('connection', (socket) => {

    console.log("Connection incoming!")

    socket.on('joinRoom', (msg) => {
        socket.join(msg.mac);
        phones[msg.mac] = msg.ip;
    })

    socket.on('disconnect', () => {
        console.log("Client disconnected!");
    });
});

server.listen(cfg.port, () => {
    console.log('listening on http://localhost:' + cfg.port);
});