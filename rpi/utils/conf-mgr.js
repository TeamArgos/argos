var config = {
    "devices": {
        "hue": {
            "bridge": {
                "credentials": {

                }
            }
        }
    }
};

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
}

function getConfig(str) {
    var levels = str.split(".");
    var obj = config;
    try {
        for (var i = 0; i < levels.length; i++) {
            obj = obj[levels[i]];
        }
    } catch (e) {
        return undefined;
    }
    return obj;
}

exports.saveCredentials = function(id, credentials, type, make) {
    addConfig(`devices.${make}.${type}.credentials.${id}`, credentials);
}

exports.getCredentials = function(id, type, make) {
    return getConfig(`devices.${make}.${type}.credentials.${id}`);
}
