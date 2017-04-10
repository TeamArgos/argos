var request = require("request");
var config = require("../utils/conf-mgr");

var WebApi = function() {
    this.baseUrl = "http://localhost:8080";
    this.uid = config.getUid();
}

WebApi.prototype.notifyState = function(deviceId, state) {
    return new Promise((resolve, reject) => {
        var url = `${this.baseUrl}/notify_state/${this.uid}/${deviceId}`;
        request.put(url, {json:state}, (err, res, body) => {
            if (err) reject(err);
            resolve(body);
        })
    })
}

WebApi.prototype.notifyStateBatch = function(devices) {
    return new Promise((resolve, reject) => {
        var url = `${this.baseUrl}/notify_state/${this.uid}`;
        request.put(url, {json:devices}, (err, res, body) => {
            if (err) {
                reject(err);
                console.log(err);
            }
            resolve(body);
        })
    })
}

module.exports = WebApi;
