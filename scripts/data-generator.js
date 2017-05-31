var dataTemplate = require("./device.json");
var request = require("request");

var minInWk = 60 * 24 * 7;
var nWeeks = 0.015;
var millisMin = 1000 * 60;
var start = new Date();
start.setTime(start.getTime() - (minInWk * nWeeks * millisMin));

var baseUrl = "https://argosbackend.herokuapp.com"
var fulcrumId = "9cb6d0d20179";

var url = baseUrl + "/notify_state/9cb6d0d20179";

var devices = [
    {id: "00:17:88:01:00:d4:12:08-0a", name: "Hue Lamp 1"},
    {id: "00:17:88:01:00:d4:12:08-0b", name: "Hue Lamp 2"},
    {id: "00:17:88:01:00:d4:12:08-0c", name: "Hue Lamp 3"}
];

request.post(baseUrl + "/clear_classifiers", (err, res, body) => {
    var timestamp = start.getTime();
    var r;
    var on;
    for (var i = timestamp; i < timestamp + parseInt(millisMin * minInWk * nWeeks); i += millisMin) {
        var t = new Date(i);
        var reqDevices = {};
        for (let d of devices) {
            var obj = JSON.parse(JSON.stringify(dataTemplate));
            obj.timestamp = i;
            obj.uniqueid = d.id;
            obj.name = d.name;

            on = isOn(t);
            r = Math.random();
            if (r > 0.2) {
                obj.state.on = on;
            } else {
                obj.state.on = !on;
            }
            reqDevices[d.id] = obj;
        }
        request.put(url, {json: reqDevices});
    }
});

function isOn(date) {
    var h = date.getHours();
    var reasonableHour = h > 17 || (h > 7 && h < 9);
    return reasonableHour;
}