var DeviceService = require("../services/device-service");
var UserService = require("../services/user-service");
var auth = require("basic-auth");


module.exports = function(app, ds, us) {
    var userIsHome = function(fulcrumId, ip) {
        return new Promise((resolve, reject) => {
            us.getMappingsByFulcrum(fulcrumId).then(users => {
                var tasks = [];
                for (var user in users) {
                    tasks.push(us.withinRange(user, fulcrumId, 1000));
                }
                Promise.all(tasks).then(success => {
                    resolve(success.indexOf(true) > -1);
                })
            });
        });
    }

    app.get("/health", (req, res) => {
        res.send("Success");
    })

    app.put("/notify_state/:fulcrumId/:deviceId", (req, res) => {
        var did = req.params.deviceId;
        var fulcrumId = req.params.fulcrumId;
        var state = req.body.state;
        us.notifyIp(fulcrumId, "fulcrum", req.connection.remoteAddress);
        userIsHome(fulcrumId, req.connection.remoteAddress).then((isHome) => {
            state.isHome = isHome
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

    app.post("/set_state/:fulcrumId/:deviceId", (req, res) => {
        var did = req.params.deviceId;
        var fulcrumId = req.params.fulcrumId;
        var uid = req.headers.Token;
        var on = req.body.on;
        us.notifyIp(userId, "user", req.connection.remoteAddress);
        ds.setDeviceState(did, fulcrumId, on).then((r) => {
            res.send({success: true});
        }).catch((err) => {
            res.send({success: false});
        }); 
    })

    app.get("/devices/:userId", (req, res) => {
        var userId = req.params.userId;
        us.notifyIp(userId, "user", req.connection.remoteAddress);
        ds.getDevices(userId).then((devices) => {
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
}
