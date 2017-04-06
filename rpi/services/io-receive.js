var request = require("request");
var io = require("socket.io-client");
var port = 8080;
var baseUrl = "http://localhost:" + port;

module.exports.listen = function(url, uid) {
    var socket = io(url, {query: `clientId=${uid}`});

    socket.on("setState", (req) => {
        var data = {
            id: req.deviceId,
            on: req.on
        }
        request.post(`${baseUrl}/set_state`, {json: data}, (err, res, body) => {
            if (err) console.log(err);
        });
    })
}
