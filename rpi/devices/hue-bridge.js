var request = require('request');
var Promise = require('promise');
var baseUrl = 'https://www.meethue.com/api';
var config = require('../utils/conf-mgr');

module.exports.make = "hue";

var discovery = {};
var env = process.env.dev ? "dev" : "prod";

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
            id: -1
        }
        resolve([bridge]);
    })
}

function saveHubCreds(username, hubId, hubIp) {
    var creds = {
        username: username,
        hubId: hubId,
        hubIp: hubIp
    }
    config.saveCredentials(hubId, creds, "bridge", "hue");
}

function getUser(hub) {
    return new Promise((resolve, reject) => {
        var uid = config.getCredentials(hub.id, "bridge", "hue");
        if (!uid) {
            createUser(hub.ip, hub.id).then(u => resolve(u));
        } else {
            resolve(uid);
        }
    })
    return uid;
}

function createUser(ip, hubid) {
    var url = `http://${ip}/api`;
    return new Promise((resolve, reject) => {
        request.post(url, {json: {"devicetype": "my_hue_app#iphone peter"}}, (err, res, body) => {
            for (let u of body) {
                if (u.success) {
                    saveHubCreds(u.success.username, hubid, ip)
                    resolve(u.success.username);
                } else {
                    console.log("Failed to create a user for hub: " + ip);
                    resolve(undefined);
                }
            }
        })
    })
}

module.exports.discover = function() {
    return new Promise((resolve, reject) => {
        discovery[env]().then((bridges) => {
            var promises = bridges.map((b) => getUser(b));
            Promise.all(promises).then((users) => {
                resolve(bridges);
            })
        });
    })
}
