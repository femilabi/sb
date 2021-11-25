const firebase = require("firebase-admin");

let serviceAccount = require("../../game-test-f3300-firebase-adminsdk-5mn6o-4302695558.json");
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://game-test-f3300.firebaseio.com",
});

let Database = firebase.database();

module.exports = { Database };
