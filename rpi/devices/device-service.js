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
        Promise.all(promises).then((device_arrs) => {
            var ids = [];
            for(let make of device_arrs) {
                for (let d of make) {
                    this.devices[d.id] = d;
                    ids.push(d.id);
                }
            }
            
            resolve(ids);
        })

    })
}

module.exports = DeviceService;
