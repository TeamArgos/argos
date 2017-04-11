var express = require("express")
var bodyParser = require("body-parser");
var app = express();
var argv = require("minimist")(process.argv.slice(-2));
var WebApi = require("./services/webapi-service");
var JobService = require('./services/job-service');
var io = require('./services/io-receive');

var api = new WebApi();
var js = new JobService();

if (argv.d || argv.dev) process.env.dev = true;
if (argv.e || argv.emulator) process.env.USE_EMULATOR = true;
if (argv.b) process.env.PROD_BACKEND = true;

var config = require("./utils/conf-mgr");
config.startup();

app.use(bodyParser.json());

// Adds the routes in routes.js to our express app
require("./app/routes")(app);

let port = 8000;

// Start express app
app.listen(port, () => {
	console.log("Listening on " + port);
	js.runSetStateJob();
	js.runDiscoverJob();
	io.listen(api.baseUrl, config.getUid());
});
