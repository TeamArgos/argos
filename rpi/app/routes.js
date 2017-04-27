var DeviceService = require('../devices/device-service');
var ds = new DeviceService();

/**
 * Endpoints for the argos hardware device.
 */
module.exports = function(app) {
	// Important that 
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

	app.post("/set_state", function(req, res) {
		var on = req.body.on;
		var id = req.body.id;
		ds.setState(id, on).then((body) => {
			var obj = {};
			if (body) {
				if (body[0]) {
					obj.success = true;
				}
			} else {
				obj.success = false;
			}
			res.json(obj);
		}).catch((err) => {
			res.status(400).send("State could not be set");
		});
	})

	app.post("/discover", function(req, res) {
		ds.discover().then((body) => {
			res.json(body);
		});
	})
}
