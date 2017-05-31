let NBClassifier = require("./nb-classifier");
let fs = require("fs");
var classes = ["on", "off"];
var features = ["day", "hour", "month"];

function Classifier() {
    this.classifier = new NBClassifier(features, classes);
}

function convertSet(dataset) {
    var data = [];
    for (var timestamp in dataset) {
        var d = convertData(dataset[timestamp], timestamp);
        data.push(d);
    }
    return data;
}

function convertData(data, timestamp) {
    var formatted = {};
    formatted.class = data.state.on ? "on" : "off";
    formatted.trueTimestamp = timestamp;
    var ts = new Date(parseInt(timestamp));
    formatted.features = {
        day: ts.getDay(),
        hour: ts.getHours(),
        month: ts.getMonth(),
        minute: ts.getMinutes(),
        isHome: data.isHome ? data.isHome : false,
        reachable: data.state.reachable,
        uniqueId: data.uniqueId,
        type: data.type
    };

    return formatted;
}

Classifier.prototype.trainData = function(data) {
    for (let d of data) {
        this.train(d);
    }
}

Classifier.prototype.train = function(d, timestamp, transform) {
    if (transform)
        d = convertData(d, timestamp)
    this.classifier.train(d);
}

Classifier.prototype.trainFromJson = function(d) {
    var data = convertSet(d);
    this.trainData(data);
}

Classifier.prototype.classify = function(data, timestamp, transform) {
    if (transform)
        data = convertData(data, timestamp)
    var pred = this.classifier.classify(data);
    var c = false;
    if (pred.class == data.class) {
        c = !c;
    }
    return pred;
}

/**
 * Take data and extrapolate to be n times as long. Takes as input
 * transformed data
 */
function extrapolate(data, n) {
    var newData = [];
    var minuteMillis = 60 * 1000;
    for (var i = 0; i < data.length * n; i++) {
        newData.push(data[i % n]);
    }
    return newData;
}


function shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
}

// For running as a script
if (require.main == module) {
    var firebaseAdmin = require("firebase-admin");
    var cred = require("./admin_key.json");
    var classifier = new Classifier();
    firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(cred),
        databaseURL: "https://argos-f950e.firebaseio.com"
    });
    var db = firebaseAdmin.database();
    var fulcrumId = "9cb6d0d20179";
    var deviceHistory = db.ref().child("device-history");
    var classifications = [];
    deviceHistory.child(fulcrumId).once("value").then(snapshot => {
        var val = snapshot.val();
        var keys = {};
        var len = 0;

        for (let device of Object.keys(val)) {
            keys[device] = Object.keys(val[device]);
            len = keys[device].length;
            keys[device].sort(function(a, b) {
                return parseInt(a) - parseInt(b);
            })
        }
        for (var i = 0; i < len; i++) {
            for(let device of Object.keys(val)) {
                var time = keys[device][i];
                var d = val[device][time];
                var c = classifier.classify(d, time, true);
                c.timestamp = time;
                if (device === "00:17:88:01:00:d4:12:08-0a") {
                    classifications.push(c);
                }
                classifier.train(d, time, true);
            }
        }
        fs.writeFileSync(__dirname + "/viz/data/classifications.json",
            JSON.stringify(classifications));
        process.exit(0);
    });
}

module.exports.Classifier = Classifier;
module.exports.shuffle = shuffle;
