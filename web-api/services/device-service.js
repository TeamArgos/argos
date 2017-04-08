var fb = require("./firebase-service");

function DeviceService(homeService) {
    this.db = fb.db;
    this.hs = homeService;
    this.devices = this.db.ref().child("devices");
    this.deviceHistory = this.db.ref().child("device-history");
}

/**
 * Notifies argos about the current state of a device. Used to track
 * state over time
 */
DeviceService.prototype.notifyState = function(deviceId, uid, state) {
    return new Promise((resolve, reject) => {
        var timestamp = (new Date()).getTime();
        var path = `${uid}/${deviceId}`;
        var historyPath = `${path}/${timestamp}`;
        var curr = this.devices.child(path).set(state);
        var history = this.deviceHistory.child(historyPath).set(state)
            
        Promise.all([curr, history]).then((res) => {
            resolve(res);
        }).catch((err) => {
            reject(err);
        });
    })
}

DeviceService.prototype.getDevices = function(uid) {
    return new Promise((resolve, reject) => {
        this.devices.once("value").then((snapshot) => {
            var obj = snapshot.val();
            var d = {};
            for (var key in obj) {
                for (var deviceId in obj[key]) {
                    d[deviceId] = obj[key][deviceId];
                }
            }
            resolve(d);
        })
    })
}

/**
 * Sets the state of device with `deviceId` for user with `uid`
 */
DeviceService.prototype.setDeviceState = function(deviceId, uid, on) {
    return this.hs.setDeviceState(deviceId, uid, on);
}

DeviceService.prototype.getDeviceState = function(deviceId, uid) {

}

module.exports = DeviceService;
