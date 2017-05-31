var DeviceService = require("../services/device-service");
var UserService = require("../services/user-service");
var auth = require("basic-auth");


module.exports = function(app, ds, us) {
    var userIsHome = function(fulcrumId, ip) {
        return Promise.resolve(true);
    } 
    app.get("/health", (req, res) => {
        res.send("Success");
    })

    app.post("/clear_classifiers", (req, res) => {
        ds.clearClassifiers();
        res.send("Success");
    });

    app.put("/notify_state/:fulcrumId/:deviceId", (req, res) => {
        var did = req.params.deviceId;
        var fulcrumId = req.params.fulcrumId;
        var state = req.body.state;
        us.notifyIp(fulcrumId, "fulcrum", req.connection.remoteAddress);
        userIsHome(fulcrumId, req.connection.remoteAddress).then((isHome) => {
            state.isHome = isHome;
            ds.notifyState(did, fulcrumId, state).then((body) => {
                res.send(body);
            }).catch((err) => {
                console.log(err);
                res.status(500).send(err.toString());
            });
        });
    })

    app.put("/notify_state/:fulcrumId", (req, res) => {
        var devices = req.body;
        var fulcrumId = req.params.fulcrumId;
        us.notifyIp(fulcrumId, "fulcrum", req.connection.remoteAddress);
        userIsHome(fulcrumId, req.connection.remoteAddress).then((isHome) => {
            ds.notifyStateBulk(devices, req.params.fulcrumId, isHome).then(success => {
                res.send(success);
            }).catch(err => {
                console.log(err)
                res.status(500).send(err);
            })
        });
    })

    app.post("/set_limit/:fulcrumId/:deviceId/:limit", (req, res) => {
        var did = req.params.deviceId;
        var fulcrumId = req.params.fulcrumId;
        var uid = req.headers.token;
        us.notifyIp(uid, "user", req.connection.remoteAddress);
        ds.setNotificationThreshold(did, fulcrumId, req.params.limit).then(() => {
            res.send({"Success": true});
        })
    });

    app.post("/set_state/:fulcrumId/:deviceId", (req, res) => {
        var did = req.params.deviceId;
        var fulcrumId = req.params.fulcrumId;
        var uid = req.headers.token;
        var on = req.body.on;
        us.notifyIp(uid, "user", req.connection.remoteAddress);
        ds.setDeviceState(did, fulcrumId, on).then((r) => {
            res.send({success: true});
        }).catch((err) => {
            res.send({success: false});
        }); 
    })

    app.get("/devices/:userId", (req, res) => {
        var userId = req.params.userId;
        var days = req.query.d;
        us.notifyIp(userId, "user", req.connection.remoteAddress);
        ds.getDevices(userId, days).then((devices) => {
            res.json(devices);
        }).catch((err) => {
            console.log(err);
            res.status(500).send(err);
        });
    });

    app.post("/map_fulcrum", (req, res) => {
        var uid = req.body.uid;
        var fulcrumId = req.body.fulcrumId;
        us.notifyIp(uid, "user", req.connection.remoteAddress);
        us.mapFulcrum(uid, fulcrumId).then(success => {
            res.send(success);
        });
    })

    app.post("/create_user", (req, res) => {
        var user = auth(req);
        us.makeNewUser(req.body.username, user.name, user.pass).then(u => {
            res.json(u);
        }).catch(err => {
            res.status(403).send(err);
        });
    })

    app.get("/sign_in", (req, res) => {
        var user = auth(req);
        us.getUserToken(user.name, user.pass).then(u => {
            res.json(u);
        }).catch(err => {
            console.log(err);
            res.status(403).send(err);
        })
    })

    app.get("/get_time_series/:fulcrumId/:deviceId", (req, res) => {
        var fulcrumId = req.params.fulcrumId;
        var deviceId = req.params.deviceId;
        var q = req.query;
        ds.getTimeSeries(deviceId, fulcrumId, q.from, q.to).then(val => {
            res.json(val);
        }).catch(err => {
            res.status(404).send(err);
        })
    })

    /**
     * Gives the cost of using one device of type `make` for 1 hour
     * is state (on average)
     */
    app.get("/energy_cost/:make/:state", (req, res) => {
        var state = req.params.state;
        state = state.replace(/(%20)|(+)/g, " ");
        ds.getEnergyCost(req.params.make, state).then((val) => {
            res.json(val);
        }).catch((err) => {
            console.log(err);
            res.json({success: false, error: err});
        });
    });

    app.post("/energy_usage/:userId/:state", (req, res) => {
        var userId = req.params.userId;
        var state = req.params.state;
        state = state.replace(/(%20)|(\+)/g, " ");
        var devices = req.body.devices;
        var weeks = req.query.w;
        if (!weeks)
            weeks = 4;
        else
            weeks = parseInt(weeks);
        ds.getEnergyUsage(devices, weeks, state).then((response) => {
            res.json(response);
        }).catch((err) => {
            console.log(err);
            res.status(500).send(err);
        });
    })
}
