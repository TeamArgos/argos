var express = require('express');
var app = express();

var argv = require("minimist")(process.argv.slice(-2));

if (argv.d || argv.dev) process.env.dev = true;