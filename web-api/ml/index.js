let NBClassifier = require("./nb-classifier");
let fs = require("fs");

var data = fs.readFileSync("./data/sample.json");
data = JSON.parse(data);
data = convertSet(data);

var classes = ["on", "off"];
var features = ["timestamp", "uniqueid", "type"];

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
    formatted.trueTimestamp = timestamp;
    var ts = new Date(parseInt(timestamp));
    ts.setMilliseconds(0);
    ts.setSeconds(0);
    ts.setMinutes(0);
    formatted.features = {
        timestamp: ts.getTime().toString(),
        reachable: data.state.reachable,
        uniqueId: data.uniqueId,
        type: data.type
    };

    return formatted;
}

function trainData(data) {
    for (let d of data) {
        classifier.train(d);
    }
}

function classify(data) {
    var correct = 0;
    var total = 0;
    for (let d of data) {
        var pred = classifier.classify(d);
        var c = false;
        if (pred.class == d.class) {
            correct++;
            c = !c;
        }
        total++;
        console.log(`${pred.certainty} certain. Correct: ${c}`);
    }
    console.log(`${correct} correct out of ${total} total`);
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

var split = Math.floor((data.length / 3) * 2)

trainData(data.slice(0, split));
classify(data.slice(split, data.length));
