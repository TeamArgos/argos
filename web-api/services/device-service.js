var fb = require("./firebase-service");
var ml = require('../ml');

function DeviceService(homeService, config) {
    this.hs = homeService;
    this.fs = new fb(config);
    this.db = this.fs.db;
    this.classifiers = {};
    this.devices = this.db.ref().child("devices");
    this.deviceHistory = this.db.ref().child("device-history");
    this.fulcrumMappings = this.db.ref().child("fulcrum-mappings");
}

/**
 * A method for debugging to allow classifer data to be backfilled.
 */
DeviceService.prototype.initClassifier = function(fulcrumId) {
    return new Promise((resolve, reject) => {
        this.classifiers[fulcrumId] = new ml.Classifier();
        var c = this.classifiers[fulcrumId];
        this.deviceHistory.child(fulcrumId).once("value").then(snapshot => {
            var val = snapshot.val();
            for (var device in val) {
                var data = val[device];
                c.trainFromJson(data);
            }
            resolve();
        }).catch(err => {
            console.log(err);
            reject(err);
        })
    })
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
        var history = this.deviceHistory.child(historyPath).set(state);
        var init = undefined;

        if (!(uid in this.classifiers)) {
            init = this.initClassifier(uid);
        }
            
        Promise.all([curr, history, init]).then((res) => {
            var classification = this.classifiers[uid].classify(state, timestamp, true);
            console.log("Classification: ", classification);
            this.classifiers[uid].train(state, timestamp, true);
            if (classification.anomaly && classification.certainty >= 0.90) {
                // send a notification
                console.log("ANOMALY");
            }
            resolve({"success": true});
        }).catch((err) => {
            reject({"success": false, "err": err});
        });
    })
}

/**
 * Notifies the state for multiple devices
 */
DeviceService.prototype.notifyStateBulk = function(devices, fulcrumId, isHome) {
    return new Promise((resolve, reject) => {
        var ref = this.devices.child(fulcrumId);
        var promises = [];
        ref.once("value").then(snapshot => {
            var currDevices = snapshot.val();
            for (var k in currDevices) {
                var s = currDevices[k];
                if (!(k in devices)) {
                    s.state.reachable = false;
                    ref.child(k).set(s);
                } else {
                    devices[k].isHome = isHome;
                    promises.push(this.notifyState(k, fulcrumId, devices[k]));
                    delete devices[k];
                }
            }

            for (var remaining in devices) {
                devices[remaining].isHome = isHome;
                promises.push(this.notifyState(remaining, fulcrumId, devices[remaining]));
            }

            Promise.all(promises).then(res => {
                resolve({"success": true});
            }).catch(err => {
                reject({"success": false, "err": err});
            })
        })
    })
}

DeviceService.prototype.getDevices = function(uid) {
    return new Promise((resolve, reject) => {
        var promises = [this.devices.once("value"), this.fulcrumMappings.child(uid).once("value")];
        Promise.all(promises).then(responses => {
            var deviceList = responses[0].val();
            var mappings = responses[1].val();
            var d = {};
            for (var key in mappings) {
                for (var deviceId in deviceList[key]) {
                    d[deviceId] = deviceList[key][deviceId];
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

DeviceService.prototype.getTimeSeries = function(deviceId, fulcrumId, from, to) {
    return new Promise((resolve, reject) => {
        var ref = this.deviceHistory.child(`${fulcrumId}/${deviceId}`).orderByKey();
        if (from) {
            ref = ref.startAt(from);
        }
        if (to) {
            ref = ref.endAt(to);
        }
        ref.once("value").then(snapshot => {
            var val = snapshot.val();
            resolve(val);
        }).catch(err => {
            reject(err);
        })
    })
}

DeviceService.prototype.getDeviceState = function(deviceId, uid) {

}

module.exports = DeviceService;
