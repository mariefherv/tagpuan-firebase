// config/firebase.config.js
const admin = require("firebase-admin");
const path = require("path");

// Load service account key
const serviceAccount = require(path.resolve(__dirname, "../serviceAccountKey.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
console.log("Firestore DB initialized:", !!db);

module.exports = { admin, db };
