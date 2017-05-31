var firebaseAdmin = require("firebase-admin");
var firebase = require("firebase");

var FirebaseService = function(config) {
    if (firebase.apps.length === 0)
        firebase.initializeApp(config.client_key);

    if (firebaseAdmin.apps.length === 0) {
        firebaseAdmin.initializeApp({
            credential: firebaseAdmin.credential.cert(config.admin_key),
            databaseURL: config.database
        });
    }

    this.db = firebaseAdmin.database();
    this.messaging = firebaseAdmin.messaging();
    this.auth = firebaseAdmin.auth();
    this.signIn = firebase.auth();
}

module.exports = FirebaseService;
