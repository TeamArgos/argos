var os = require('os');
var fs = require('fs');
var cron = require("node-cron");
var request = require("request");

exports.createPoll = function() {
	var configDir = os.homedir() + "/.argos/";
	cron.schedule("*/5 * * * * *", () => {
		var ip = getMachineIp();
		var fname = configDir + "/ip"
		var oldip = undefined;
		if (fs.existsSync(fname)) {
			oldip = fs.readFileSync(fname);
		}

		if (!oldip || oldip != ip) {
			console.log("Old IP: " + oldip + ", New IP: " + ip);
			fs.writeFileSync(fname, ip);
			request.post("http://localhost:8080/update_ip", {"ip": ip})
		}
	}, null, true, "America/Los_Angeles");
}

exports.removePoll = function() {

}

/**
 * Gets the external IP address of this machine
 */
function getMachineIp() {
	var interfaces = os.networkInterfaces();
	for (var i in interfaces) {
		for (let addr of interfaces[i]) {
			if (addr.family.toLowerCase() === 'ipv4' && addr.internal === false) {
				return addr.address.toString();
			}
		}
	}
}