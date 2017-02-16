var http = require("http");
var express = require("express")
var bodyParser = require("body-parser");
var app = express();
app.use(bodyParser.json());

// Adds the routes in routes.js to our express app
require("./app/routes")(app);

let port = 8080;

var cmgr = require("./config_manager");

cmgr.init();

app.listen(port, () => {
	console.log("Listening on " + port);
})