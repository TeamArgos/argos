var iputil = require("./ip_poll");
var fs = require("fs");
var os = require("os");

exports.init = function() {
	createConfig();
	iputil.createPoll();
}

function createConfig() {
	var configDir = os.homedir() + "/.argos/";
	if (!fs.existsSync(configDir)) {
		fs.mkdirSync(configDir);
	}
}