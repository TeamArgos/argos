let NBClassifier = require("./nb-classifier");
let fs = require("fs");

var data = fs.readFileSync("./data/sample.json");
data = JSON.parse(data);
data = convertSet(data);

var classes = ["on", "off"];
var features = ["timestamp"];

let classifier = new NBClassifier(features, classes);

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
    var ts = new Date(parseInt(timestamp));
    ts.setMilliseconds(0);
    ts.setSeconds(0);
    ts.setMinutes(0);
    formatted.features = {
        timestamp: ts.getTime().toString(),
        reachable: data.state.reachable
    };

    return formatted;
}

function trainData(data) {
    for (let d of data) {
        classifier.train(d);
    }
}

function classify(data) {
    for (let d of data) {
        console.log(classifier.classify(d));
    }
}

var split = Math.floor((data.length / 3) * 2)

trainData(data.slice(0, split));
classify(data.slice(split, data.length));
