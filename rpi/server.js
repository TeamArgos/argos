var http = require("http");
var express = require("express")
var bodyParser = require("body-parser");
var app = express();
var argv = require("minimist")(process.argv.slice(-2));

if (argv.d || argv.dev) process.env.dev = true;

var DeviceService = require('./devices/device-service');
var ds = new DeviceService();

var device_libs = {
	"hue": require('./devices/hue-bridge')
}

app.use(bodyParser.json());

// Adds the routes in routes.js to our express app
require("./app/routes")(app);

let port = 8080;

// Start express app
app.listen(port, () => {
	console.log("Listening on " + port);
	ds.discover().then((device_ids) => {
		console.log(device_ids);
	});
})
