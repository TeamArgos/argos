let NBClassifier = require("./nb-classifier");
let fs = require("fs");
var classes = ["on", "off"];
var features = ["day", "hour", "month", "isHome"];

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

// For running as main
//var data = fs.readFileSync("./data/sample.json");
//data = JSON.parse(data);
//data = convertSet(data);
//var split = Math.floor((data.length / 3) * 2)
//shuffle(data);
//var training = data.slice(0, split);
//var test = data.slice(split, data.length)
//trainData(training);
//classify(test);

module.exports.Classifier = Classifier;
module.exports.shuffle = shuffle;
