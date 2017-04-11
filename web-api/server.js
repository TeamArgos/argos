var express = require('express');
var bodyParser = require('body-parser');
var HomeService = require("./services/home-service");
var DeviceService = require("./services/device-service");
var argv = require("minimist")(process.argv.slice(-2));
var AWS = require("aws-sdk");
var s3 = new AWS.S3();

var config = require("./config.json");


var bucket = "argos-capstone";
var keys = ["admin_key.json", "client_key.json"];
var promises = keys.map((k) => {
    return s3.getObject({
        Bucket: bucket,
        Key: k
    }).promise();
});

Promise.all(promises).then(responses => {
    responses.forEach((r, i) => {
        var k = keys[i].split(".")[0];
        config[k] = JSON.parse(r.Body.toString());
    })

    var app = express();
    var server = require('http').createServer(app);
    var io = require("socket.io")(server);
    var hs = new HomeService(io);
    var ds = new DeviceService(hs, config);

    if (argv.d || argv.dev) process.env.dev = true;

    var port = process.env.PORT || 8080;

    app.use(bodyParser.json());
    require('./app/routes.js')(app, ds, config);

    server.listen(port, () => {
        console.log("Lisening on port " + port);
    })
}).catch(err => {
    console.log(err);
})
