var Webapi = require("../services/webapi-service");
var config = require("../utils/conf-mgr");

var device_apis = {
    "hue": require('./hue-bridge')
}

/**
 * A facade to unify APIs for different manufacturers
 */
function DeviceService() {
    this.devices = {};
    this.api = new Webapi();
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
                    this.devices[id].fulcrumId = config.getUid();
                }
            }
            this.api.notifyStateBatch(this.devices).then(() => {
                resolve(this.devices);
            }).catch(err => {
                console.log(err);
                reject(err);
            });
        })
    })
}

/**
 * Toggles the state (on/off) of device with id `id`
 * @param id A device identifier
 * @returns a promise which resolves once a device change state has been
 *          registered
 */
DeviceService.prototype.toggleDevice = function(id) {
    var device = this.getDevice(id);
    var api = device_apis[device.make];
    var state = !api.isOn(device);
    return api.setState(device, state);
}

/**
 * Sets the state of a device with `id`. If state is true, turns
 * device on. Else, turns device off
 */
DeviceService.prototype.setState = function(id, state) {
    var device = this.getDevice(id);
    if (device) {
        var api = device_apis[device.make];
        return api.setState(device, state);
    } else {
        return new Promise((resolve, reject) => resolve(undefined));
    }
}

DeviceService.prototype.getDevice = function(id) {
    return this.devices[id];
}

DeviceService.prototype.getState = function(id) {
    var d = this.getDevice(id);
    var api = device_apis[d.make];
    return api.getState(d);
}

module.exports = DeviceService;
