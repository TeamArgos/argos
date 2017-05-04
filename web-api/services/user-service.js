var request = require('request');
var firebase = require("./firebase-service");
var geoip = require("geoip-lite");
var geolib = require("geolib");

var UserService = function(config) {
    this.fs = new firebase(config);
    this.db = this.fs.db;
    this.auth = this.fs.auth;
    this.signIn = this.fs.signIn;
    this.fulcrumMappings = this.db.ref().child("fulcrum-mappings");
    this.ipCache = this.db.ref().child("ipCache");
}

UserService.prototype.makeNewUser = function(name, email, password) {
    return new Promise((resolve, reject) => {
        this.auth.createUser({
            email: email,
            emailVerified: false,
            password: password,
            displayName: name,
            disabled: false
        }).then((user) => {
            resolve(user);
        }).catch(err => {
            reject(err);
        })
    })
}

UserService.prototype.getUserToken = function(email, password) {
    return new Promise((resolve, reject) => {
        this.signIn.signInWithEmailAndPassword(email, password).then((u) => {
            var uInfo = {
                uid: u.uid,
                displayName: u.displayName,
                email: u.email
            }
            resolve(uInfo);
        }).catch(err => {
            reject(err);
        })
    })
}

UserService.prototype.notifyIp = function(id, type, ip) {
    var splitIp = ip.split(":")
    this.ipCache.child(`${type}/${id}`).set(splitIp[splitIp.length - 1]);
}

UserService.prototype.withinRange = function(userId, fulcrumId, radius) {
    return new Promise((resolve, reject) => {
        this.ipCache.once("value").then(snapshot => {
            var cache = snapshot.val();
            var uip = cache["user"][userId];
            var fip = cache["fulcrum"][fulcrumId];
            if (uip && fip) {
                var userLoc = geoip.lookup(uip);
                var fLoc = geoip.lookup(fip);
                if (userLoc && fLoc) {
                    var dist = geolib.getDistance(
                        {latitude: userLoc.ll[0], longitude: userLoc.ll[1]},
                        {latitude: fLoc.ll[0], longitude: fLoc.ll[1]}
                    );
                    resolve(dist <= radius);
                } else {
                    resolve(uip === fip);
                }
            }
            resolve(false);
        });
    })
}

UserService.prototype.mapFulcrum = function(userHash, fulcrumHash) {
    var userMapping = this.fulcrumMappings
        .child(`users/${userHash}/${fulcrumHash}`).set(true);
    var fulcrumMapping = this.fulcrumMappings
        .child(`fulcrum/${fulcrumHash}/${userHash}`).set(true);
    return Promise.all([fulcrumMapping, userMapping]);
}

UserService.prototype.getMappings = function(userHash) {
    return new Promise((resolve, reject) => {
        this.fulcrumMappings.child("user").child(userHash)
        .once("value").then(snapshot => {
            var obj = snapshot.val();
            resolve(obj);
        }).catch((err) => {
            reject(err);
        })
    })
}

UserService.prototype.getMappingsByFulcrum = function(fulcrumHash) {
    return new Promise((resolve, reject) => {
        this.fulcrumMappings.child("fulcrum").child(fulcrumHash)
        .once("value").then(snapshot => {
            var obj = snapshot.val();
            resolve(obj);
        }).catch((err) => {
            reject(err);
        })
    })
}

module.exports = UserService;
