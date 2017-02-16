module.exports = function(app) {
	app.post("/update_ip", function(req, res) {
		res.send(req.body.ip);
	});
}