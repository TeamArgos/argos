var request = require("request");
var io = require("socket.io-client");
var config = require("../utils/conf-mgr");
var port = 8000;
var baseUrl = "http://localhost:" + port;

module.exports.listen = function(url, uid) {
    var socket = io(url, {query: `clientId=${uid}`});
    socket.on("connect", () => {
        console.log("Connection Made");
    })

    socket.on("setState", (req) => {
        var data = {
            id: req.deviceId,
            on: req.on
        }
        request.post(`${baseUrl}/set_state`, {json: data}, (err, res, body) => {
            var success = true;
            if (err) {
                console.log(err);
                success = false;
            }
            socket.emit("taskComplete", {
                taskId: req.taskId,
                success: success
            })
        });
    })

    socket.on("disconnect", () => {
        socket.close();
        console.log("Connection lost... Retrying Connection...");
        setTimeout(() => module.exports.listen(url, uid), 1000)
    })
}
