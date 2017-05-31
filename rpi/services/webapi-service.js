var request = require("request");
var config = require("../utils/conf-mgr");

var WebApi = function() {
    if (!process.env.PROD_BACKEND && process.env.dev)
        this.baseUrl = "http://localhost:8080";
    else
        this.baseUrl = config.getConfig("web_url");
    this.uid = config.getUid();
}

/**
 * Notifies the web api of the state of a single device
 */
WebApi.prototype.notifyState = function(deviceId, state) {
    return new Promise((resolve, reject) => {
        var url = `${this.baseUrl}/notify_state/${this.uid}/${deviceId}`;
        request.put(url, {json:state}, (err, res, body) => {
            if (err) reject(err);
            resolve(body);
        })
    })
}

/**
 * Notifies the web api of the state of multiple devices at once. This
 * will also set the `reachable` flag on any unreported devices to false
 */
WebApi.prototype.notifyStateBatch = function(devices) {
    return new Promise((resolve, reject) => {
        var url = `${this.baseUrl}/notify_state/${this.uid}`;
        request.put(url, {json:devices}, (err, res, body) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(body);
        })
    })
}

module.exports = WebApi;
