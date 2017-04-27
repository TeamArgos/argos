var bleno = require("bleno");
var conf = require("../utils/conf-mgr");

var fulcrumId = splitMac(conf.getUid());

//process.env.BLENO_HCI_DEVICE_ID = 1;

var serviceUuids = ["6172", "676f", "7363", "6170"];

for (let i of fulcrumId) {
    serviceUuids.push(i);
}

bleno.on('stateChange', (state) => {
    console.log(state);
    if (state === "poweredOn") {
        bleno.startAdvertising("Service", serviceUuids, (err) => {
            if (err) console.log(err)
        });
    }
})

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
