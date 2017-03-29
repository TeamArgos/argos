module.exports = function(app) {
	app.post("/update_ip", function(req, res) {
		res.send(req.body.ip);
		console.log("Updated IP");
	});

	app.get("/", function(req, res) {
		res.send("Hello");
	})
}
