var fs = require('fs');
var os = require('os');
var defaultConfig = __dirname + "/defaults.json";
var config = require(defaultConfig);
var userConfigDir = `${os.homedir()}/${config.local_directory}`;
var userConfig = `${userConfigDir}/settings.json`;
var crypto = require('crypto')
var hash = crypto.createHash('sha256');

exports.startup = function() {
    if (!fs.existsSync(userConfigDir)){
        fs.mkdirSync(userConfigDir);
    }
    if (!fs.existsSync(userConfig))
        writeConfig();
}

// Only reload if this module has not yet been cached
if (!exports.loaded) {
    exports.startup();
    loadConfig();
    config.uid = getUserId();
}

function getUserId() {
    var id = "";
    var interfaces = os.networkInterfaces();
    for (var i in interfaces) {
        for (let n of interfaces[i]) {
            if (!n.internal && n.family === "IPv4") {
                id = n.mac;
            }
        }
    }
    id = id.replace(/:/g, "");
    return id;
}

exports.getUid = function() {
    return config.uid;
}

function loadConfig() {
    try {
        var conf = require(userConfig);
        mergeConfig(conf, config);
    } catch(e) {
        console.log(e)
        // no user settings. Ignore
    }
    exports.loaded = true;
}

function mergeConfig(src, target) {
    for (var key in src) {
        if (!(key in target)) {
            target[key] = src[key];
        } else if (Array.isArray(src[key])) {
            src[key].forEach((val, i) => {
                mergeConfig(src[key][i], target[key][i]);
            })
        } else if (typeof src[key] === "object") {
            mergeConfig(src[key], target[key]);
        } else {
            target[key] = src[key];
        }
    }
}

function addConfig(str, val) {
    var levels = str.split(".");
    var obj = config;
    var lastIndex = levels.length - 1;
    for (var i = 0; i < lastIndex; i++) {
        var l = levels[i];
        if (!(l in obj)) {
            obj[l] = {};
        }
        obj = obj[l];
    }
    obj[levels[lastIndex]] = val;
    writeConfig();
}

module.exports.getConfig = function(str) {
    var levels = str.split(".");
    var obj = config;
    try {
        for (var i = 0; i < levels.length; i++) {
            obj = obj[levels[i]];
        }
    } catch (e) {
        console.log(e);
        return undefined;
    }
    return obj;
}

function writeConfig() {
    fs.writeFile(userConfig, JSON.stringify(config), function (err) {
        if (err) return console.log(err);
    });
}

exports.saveCredentials = function(id, credentials, type, make) {
    addConfig(`devices.${make}.${type}.credentials.${id}`, credentials);
}

exports.getCredentials = function(id, type, make) {
    return exports.getConfig(`devices.${make}.${type}.credentials.${id}`);
}
