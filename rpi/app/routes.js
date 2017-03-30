var DeviceService = require('../devices/device-service');
var ds = new DeviceService();
ds.discover().then((device_ids) => {});

module.exports = function(app) {
	app.post("/update_ip", function(req, res) {
		res.send(req.body.ip);
		console.log("Updated IP");
	})

	app.get("/", function(req, res) {
		res.send("Hello");
	})

	app.get("/devices", function(req, res) {
		res.json(ds.devices);
	})

	/**
	 * Toggles the state (on/off) of a device by id
	 */
	app.post("/toggle_state", function(req, res) {
		var id = req.body.id;
		var hubId = req.body.hub_id;
		var type = req.body.type;
		ds.toggleDevice(id, type, hubId).then((body) => {
			res.send("Success");
		}).catch((err) => {
			res.send(err);
		})
	})
}
