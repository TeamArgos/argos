var bleno = require("bleno");
var conf = require("../utils/conf-mgr");

var fulcrumId = splitMac(conf.getUid());
var serviceUuids = ["6172", "676f", "7363", "6170"];

for (let i of fulcrumId) {
    serviceUuids.push(i);
}

module.exports.advertise = function() {
    bleno.on('stateChange', (state) => {
        console.log(state);
        if (state === "poweredOn") {
            bleno.startAdvertising("Service", serviceUuids, (err) => {
                if (err) console.log(err)
            });
        }
    })
}

module.exports.stop = function() {
    bleno.stopAdvertising();
}

bleno.on('advertisingStart', () => {
    console.log("Started advertising service");
})

bleno.on('accept', () => {
    console.log("App in range");
})

bleno.on('disconnect', (client) => {
    console.log(client)
});

bleno.on('advertisingStop', () => {
    console.log("Advertising stopped");
});

bleno.on('advertisingStartError', (error) => {
    console.log("Error");
});


function splitMac(mac) {
    return mac.match(/.{4}/g);
}
