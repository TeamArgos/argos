var DeviceService = require("../services/device-data");

module.exports = function(app, ds) {
    app.get("/health", (req, res) => {
        res.send("Success");
    })

    app.put("/notify_state/:uid/:deviceId", (req, res) => {
        var did = req.params.deviceId;
        var uid = req.params.uid;
        var state = req.body.state;
        ds.notifyState(did, uid, state).then(() => {
            res.send("It worked buddy!");
        }).catch((err) => {
            console.log(err);
            res.send("It didnt work buddy :(")
        });
    })

    app.post("/set_state/:uid/:deviceId", (req, res) => {
        var did = req.params.deviceId;
        var uid = req.params.uid;
        var on = req.body.on;
        ds.setDeviceState(did, uid, on); 
        res.send("Success");
    })
}
