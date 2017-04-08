var request = require('request');
var firebase = require("./firebase-service");


var UserService = function() {
    this.db = firebase.db;
    this.auth = firebase.auth;
    this.signIn = firebase.signIn;
    this.fulcrumMappings = this.db.ref().child("fulcrum-mappings");
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

UserService.prototype.mapFulcrum = function(userHash, fulcrumHash) {
    return new Promise((resolve, reject) => {
        this.fulcrumMappings
            .child(userHash)
            .child(fulcrumHash)
            .set(true).then((snapshot) => {
                console.log(snapshot)
                resolve(true);
            });
    })
}

UserService.prototype.getMappings = function(userHash) {
    console.log(this.fulcrumMappings);
    return new Promise((resolve, reject) => {
        this.fulcrumMappings.child(userHash).once("value").then(snapshot => {
            var obj = snapshot.val();
            resolve(obj);
        }).catch((err) => {
            reject(err);
        })
    })
}

module.exports = UserService;
