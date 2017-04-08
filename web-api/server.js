var express = require('express');
var bodyParser = require('body-parser');
var firebase = require("./services/firebase-service");
var HomeService = require("./services/home-service");
var DeviceService = require("./services/device-service");
var argv = require("minimist")(process.argv.slice(-2));

var app = express();
var server = require('http').createServer(app);
var io = require("socket.io")(server);
var hs = new HomeService(io);
var ds = new DeviceService(hs);

if (argv.d || argv.dev) process.env.dev = true;

var port = process.env.PORT || 8080;

app.use(bodyParser.json());



require('./app/routes.js')(app, ds);

server.listen(port, () => {
    console.log("Lisening on port " + port);
})
