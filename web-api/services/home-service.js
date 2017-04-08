var HomeService = function(io) {
    this.clients = {}
    io.on('connection', (client) => {
        var clientId = client.request._query.clientId;
        this.clients[clientId] = client;

        client.on("disconnect", () => {
            console.log("client disconnect")
            delete this.clients[clientId];
        })
    });
}

HomeService.prototype.setDeviceState = function(deviceId, uid, on) {
    var c = this.clients[uid];
    c.emit("setState", {
        deviceId: deviceId,
        on: on
    });
}

module.exports = HomeService;
