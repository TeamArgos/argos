var fb = require("./firebase-service");
var UserService = require("./user-service");
var ml = require('../ml');

function DeviceService(homeService, config) {
    this.hs = homeService;
    this.us = new UserService(config);
    this.fs = this.us.fs;
    this.db = this.fs.db;
    this.classifiers = {};
    this.devices = this.db.ref().child("devices");
    this.deviceHistory = this.db.ref().child("device-history");
    this.fulcrumMappings = this.db.ref().child("fulcrum-mappings");
}

DeviceService.prototype.clearClassifiers = function() {
    this.classifiers = {};
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
            resolve(c);
        }).catch(err => {
            console.log(err);
            reject(err);
        })
    })
}

DeviceService.prototype.getClassifier = function(fulcrumId) {
    if (!(fulcrumId in this.classifiers)) {
        return this.initClassifier(fulcrumId);
    } else {
        return Promise.resolve(this.classifiers[fulcrumId]);
    }
}

DeviceService.prototype._notifyHelper = function(deviceId, uid, state) {
    var path = `${uid}/${deviceId}`;
    var historyPath = `${path}/${state.timestamp}`;
    var curr = this.devices.child(path).update(state);
    var history = this.deviceHistory.child(historyPath).set(state);
    return Promise.all([curr, history]);
}

DeviceService.prototype.setNotificationThreshold = function(deviceId, fulcrumId, limit) {
    var path = `${fulcrumId}/${deviceId}`;
    return this.devices.child(path).update({threshold: parseFloat(limit)});
}

/**
 * Notifies argos about the current state of a device. Used to track
 * state over time
 */
DeviceService.prototype.notifyState = function(deviceId, uid, state, classifier) {
    return new Promise((resolve, reject) => { 
        this._notifyHelper(deviceId, uid, state).then((res) => {
            classifier.train(state, state.timestamp, true);
            resolve({"success": true, "state": state});
        }).catch((err) => {
            reject({"success": false, "err": err});
        });
    })
}

function setAttrs(device, classifier, extras) {
    var timestamp = (new Date()).getTime();
    if (!device.timestamp)
        device.timestamp = timestamp;
    if (!device.classification) {
        var classification = classifier.classify(device, timestamp, true);
        device.classification = classification;
    }
    if (extras) {
        for (var k in extras) {
            device[k] = extras[k];
        }
    }
}

function recentlyChanged(device) {
    var date = new Date().getTime();
    var hour = 1000 * 60 * 60;
    var from = date - hour;
    return device.lastChanged > from && device.lastNotified > from;
}

/**
 * Notifies the state for multiple devices
 */
DeviceService.prototype.notifyStateBulk = function(devices, fulcrumId, isHome) {
    return new Promise((resolve, reject) => {
        return this.getClassifier(fulcrumId).then((classifier) => {
            var date = new Date();
            date = date.getTime();
            var ref = this.devices.child(fulcrumId);
            var promises = [];
            ref.once("value").then(snapshot => {
                var currDevices = snapshot.val();
                for (var k in currDevices) {
                    var curr = currDevices[k];
                    var newDevice = devices[k];
                    if (newDevice) {
                        if (recentlyChanged(curr)) {
                            newDevice.notify = false;
                        } else {
                            newDevice.notify = true;
                        }
                    }

                    if (!(k in devices)) {
                        curr.state.reachable = false;
                        setAttrs(curr, classifier);
                        ref.child(k).set(curr);
                    } else {
                        if (!curr.threshold) curr.threshold = 0.8;
                        setAttrs(newDevice, classifier, {threshold: curr.threshold});
                        promises.push(this.notifyState(k, fulcrumId, newDevice, classifier));
                        delete devices[k];
                    }
                }

                for (var remaining in devices) {
                    var device = devices[remaining];
                    device.notify = false;
                    device.lastChanged = date;
                    device.lastNotified = date;
                    setAttrs(device, classifier, {threshold: 0.8});
                    promises.push(this.notifyState(remaining, fulcrumId, device, classifier));
                }

                Promise.all(promises).then(res => {
                    this.sendBatchNotifications(res);
                    resolve({"success": true});
                }).catch(err => {
                    reject(err);
                })
            })
        });
    })
}

DeviceService.prototype.sendBatchNotifications = function(devices) {
    var notifications = [];
    for (let d of devices) {
        var classification = d.state.classification;
        var threshold = d.state.threshold / 100;
        var certainty = classification.certainty;
        if (classification.class === "on") {
            certainty = 1.0 - certainty;
        }

        var tasks = [];

        if (certainty > threshold
            && ((classification.class === "on" && !classification.anomaly)
                || (classification.class === "off" && classification.anomaly))) {
            // add to the notification
            this.us.getMappingsByFulcrum(d.state.fulcrumId).then((mappings) => {
                var notification = {
                    "deviceId": d.state.uniqueid,
                    "fulcrumId": d.state.fulcrumId,
                    "deviceName": d.state.name,
                    "desiredState": "0"
                }
                
                for (var uid in mappings) {
                    var u = uid;
                    console.log(u);
                    tasks.push(this.sendNotification(u, notification));
                }
            })
        }

    }
    return Promise.all(tasks);
}

DeviceService.prototype.sendNotification = function(userId, notification) {
    console.log(userId)
    var date = new Date().getTime();
    var payload = {
        notification: {
            title: `${notification.deviceName} is on`,
            body: `${notification.deviceName} was left on. Normally it is off at this time.`
        },
        data: notification
    }
    return this.fs.messaging.sendToTopic(userId, payload).then(res => {
        console.log(res);
        return Promise.resolve();
    }).then(() => {
        return this.devices
            .child(notification.fulcrumId)
            .child(notification.deviceId)
            .update({"lastNotified": date});
    }).catch(err => {
        console.log(err);
        return Promise.resolve();
    });
}

DeviceService.prototype.getDevices = function(uid, histDays) {
    if (!histDays) histDays = 1;
    return new Promise((resolve, reject) => {
        var promises = [
            this.devices.once("value"),
            this.fulcrumMappings.child("user").child(uid).once("value")
        ];
        Promise.all(promises).then(responses => {
            var deviceList = responses[0].val();
            var mappings = responses[1].val();
            var d = {};
            var tasks = [];
            var to = (new Date()).getTime();
            console.log("Num Days: ", histDays)
            var day = 1000 * 60 * 60 * 24;
            var from = to - (day * histDays);
            if (to > from) {
                for (var key in mappings) {
                    for (var deviceId in deviceList[key]) {
                        d[deviceId] = deviceList[key][deviceId];
                        tasks.push(this.getTimeSeries(deviceId, key, from.toString(), to.toString()));
                    }
                }
            }
            Promise.all(tasks).then(histories => {
                for (let h of histories) {
                    if (h.length > 0) {
                        d[h[0].deviceId].history = h;
                    }
                }
                resolve(d);
            }).catch(err => console.log(err));
        })
    })
}

/**
 * Sets the state of device with `deviceId` for user with `uid`
 */
DeviceService.prototype.setDeviceState = function(deviceId, uid, on) {
    return this.hs.setDeviceState(deviceId, uid, on).then(res => {
        if (res.success) {
            var path = `${uid}/${deviceId}`;
            var tasks = [
                this.devices.child(path).child("state").update({"on": on}),
                this.devices.child(path).update({"lastChanged": new Date().getTime()})
            ];

            return Promise.all(tasks).then((response) => {
                return Promise.resolve(res);
            });
        }
    }).catch(err => {
        console.log(err);
    });
}

/**
 * Gets time series data for a device
 */
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
            var histories = [];
            if (val) {
                var keys = Object.keys(val).sort((a, b) => {return parseInt(a) - parseInt(b)});
                for (let k of keys) {
                    var d = val[k];
                    var classification = d.classification;
                    classification.timestamp = k;
                    classification.deviceId = d.uniqueid;
                    classification.on = d.state.on;
                    histories.push(classification);
                }
            }
            resolve(histories);
        }).catch(err => {
            reject(err);
        })
    })
}

DeviceService.prototype.getEnergyUsage = function(devices, weeks, state) {
    var tasks = [];
    var to = new Date().getTime().toString();
    var week = 1000 * 60 * 60 * 24 * 7 * weeks;
    var from = (to - week).toString();
    for (let d of devices) {
        tasks.push(this.getTimeSeries(d.id, d.fulcrumId, from, to));
    }
    tasks.push(this.getEnergyCost("hue", state))

    return Promise.all(tasks).then(histories => {
        var ret = {};
        var cost = histories[histories.length - 1];
        histories.forEach((h, i) => {
            if (i < histories.length - 1) {
                h.forEach((unit) => {
                    if (unit.on)
                        unit.cost = cost.price_per_minute;
                    else
                        unit.cost = 0;
                })
                ret[devices[i].id] = h;
            }
        });
        return ret;
    })
}

DeviceService.prototype.getEnergyCost = function(make, state) {
    var capState = state.split(" ").map((s) => {
        s = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
        return s;
    }).join(" ");
    var tasks = [
        this.db.ref().child(`energy/${capState}`).once("value"),
        this.db.ref().child(`device-energy/${make}/watts`).once("value")
    ];
    return Promise.all(tasks).then(([price, watts]) => {
        var p = parseFloat(price.val()) / 100;
        var w = watts.val();
        var kwh = w / 1000 / 60;
        var ret = {
            "watts": w,
            "price": p,
            "kwh": kwh,
            "price_per_minute": kwh * p
        }

        return Promise.resolve(ret);
    });
}

module.exports = DeviceService;
