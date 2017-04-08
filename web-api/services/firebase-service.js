var firebaseAdmin = require("firebase-admin");
var firebase = require("firebase");
var config = require("../config.json");
var serviceAccount = require(`../${config.firebase_admin_auth}`);
var clientConfig = require(`../${config.firebase_client_auth}`)

firebase.initializeApp(clientConfig);

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: config.database
});

module.exports.db = firebaseAdmin.database();
module.exports.auth = firebaseAdmin.auth();
module.exports.signIn = firebase.auth();
