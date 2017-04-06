var firebase = require("firebase-admin");
var config = require("../config.json");
var serviceAccount = require(`../${config.firebase_auth}`);

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: config.database
});

module.exports.db = firebase.database();
