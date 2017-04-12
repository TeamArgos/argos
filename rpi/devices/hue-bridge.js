var request = require('request');
var baseUrl = 'https://www.meethue.com/api';
var config = require('../utils/conf-mgr');

module.exports.make = "hue";

var discovery = {};
var env = process.env.dev || process.env.USE_EMULATOR ? "dev" : "prod";

/**
 * Discovers hue light bridge devices
 */
discovery.prod = function() {
    return new Promise((resolve, reject) => {
        request.get(baseUrl + '/nupnp', (err, res, body) => {
            var bridges = JSON.parse(body);
            bridges = bridges.map((b) => {
                b.type = "hub";
                b.make = module.exports.make;
                b.description = "Hue Light Bridge";
                b.ip = b.internalipaddress;
                return b;
            });
            resolve(bridges);
        });
    });
}

/**
 * Simulates discovery for a local hue light bridge
 */
discovery.dev = function() {
    return new Promise((resolve, reject) => {
        var bridge = {
            type: "hub",
            make: module.exports.make,
            description: "Hue Light Bridge",
            ip: "127.0.0.1",
            id: -1,
            user: "newdeveloper"
        }
        resolve([bridge]);
    })
}

function saveHubCreds(username, hubId) {
    var creds = {
        username: username,
    }
    config.saveCredentials(hubId, creds, "bridge", "hue");
}

function getUser(hub) {
    return new Promise((resolve, reject) => {
        if (hub.user) {
            resolve(hub.user);
        } else {
            var uid = config.getCredentials(hub.id, "bridge", "hue").username;
            if (!uid) {
                createUser(hub.ip, hub.id).then(u => {
                    resolve(u);
                });
            } else {
                resolve(uid);
            }
        }
    })
}

function getDevices(url) {
    var types = ["lights"];
    return new Promise((resolve, reject) => {
        request.get(url, (err, res, body) => {
            body = JSON.parse(body);
            var devices = {};
            for (let val of types) {
                devices[val] = body[val];
            }
            resolve(devices);
        })
    });
}

function getBridgeInfo(b) {
    return new Promise((resolve, reject) => {
        getUser(b).then(uid => {
            b.user = uid;
            b.url = `http://${b.ip}/api/${uid}`;
            getDevices(b.url).then((devices) => {
                b.devices = devices;
                resolve(b);
            })
        })
    })
}

function createUser(ip, hubid) {
    var url = `http://${ip}/api`;
    return new Promise((resolve, reject) => {
        request.post(url, {json: {"devicetype": "argos#rpi"}}, (err, res, body) => {
            for (let u of body) {
                if (u.success) {
                    saveHubCreds(u.success.username, hubid)
                    resolve(u.success.username);
                } else {
                    console.log("Failed to create a user for hub: " + ip);
                    resolve(undefined);
                }
            }
        })
    })
}

function flatten(bridges) {
    var dev = {};
    bridges.forEach((b) => {
        if (b) {
            for (var key in b.devices) {
                for (var did in b.devices[key]) {
                    var device = b.devices[key][did];
                    device.id = did;
                    device.bridge = {
                        make: b.make,
                        type: b.type,
                        url: b.url,
                        id: b.id,
                        user: b.user
                    };
                    device.make = "hue";
                    device.type = key;
                    dev[device.uniqueid] = device;
                }
            }
        }
    })
    return dev;
}

module.exports.discover = function() {
    return new Promise((resolve, reject) => {
        discovery[env]().then((bridges) => {
            var promises = bridges.map((b) => getBridgeInfo(b));
            Promise.all(promises).then((updated) => {
                resolve(flatten(updated));
            }).catch((err) => {
                console.log(err);
            })
        });
    })
}

module.exports.isOn = function(device) {
    return device.state.on;
}

module.exports.setState = function(device, state) {
    switch (device.type) {
        case "lights":
            return setLightState(device, state);
        default: break;
    }
    return new Promise((resolve, reject) => reject("State cannot be set"));
}

module.exports.getState = function(device) {
    return device.state;
}

function setLightState(light, on) {
    return new Promise((resolve, reject) => {
        var url = `${light.bridge.url}/lights/${light.id}/state`;
        if (typeof on !== "boolean") on = JSON.parse(on);
        var options = {
            json: {
                on: JSON.parse(on)
            }
        }

        request.put(url, options, function(err, res, body) {
            light.state.on = on;
            if (err) console.log(err);
            resolve(body);
        });
    });
}
