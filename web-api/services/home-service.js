var HomeService = function(io) {
    this.clients = {}
    io.on('connection', (client) => {
        var clientId = client.request._query.clientId;
        client.tasks = {};
        client.task_num = 0;
        this.clients[clientId] = client;
        client.on("disconnect", () => {
            console.log("client disconnect")
            delete this.clients[clientId];
        })

        client.on("taskComplete", (data) => {
            delete client.tasks[data.taskId];
        });
    });
}

HomeService.prototype.setDeviceState = function(deviceId, uid, on) {
    return new Promise((resolve, reject) => {
        var c = this.clients[uid];
        var taskId = c.task_num;
        c.emit("setState", {
            deviceId: deviceId,
            on: on,
            taskId: taskId
        });
        c.task_num++;

        var task = c.tasks[taskId];
        while (task) {
            // wait
        }
        resolve({success: true});
    })
}

module.exports = HomeService;
