var Promise = require('promise');

var device_apis = {
    "hue": require('./hue-bridge')
}

function DeviceService() {
    this.devices = {};
}

/**
 * Discovers devices for all supported device types (see
 * `Supported devices` in the argos documentation).
 * @returns a promise
 */
DeviceService.prototype.discover = function() {
    return new Promise((resolve, reject) => {
        var promises = Object.keys(device_apis).map((key) => device_apis[key].discover());
        Promise.all(promises).then((device_arr) => {
            for(let make of device_arr) {
                for (let id of Object.keys(make)) {
                    this.devices[id] = make[id];
                }
            }
            resolve(this.devices);
        })

    })
}

DeviceService.prototype.toggleDevice = function(id) {
    var device = this.devices[id];
    var api = device_apis[device.make];
    return api.toggleDevice(device);
}

module.exports = DeviceService;
