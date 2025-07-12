const { db } = require("../config/firebase.config.js");

exports.getAllUsers = async () => {
  const snapshot = await db.collection("users").get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

exports.createUser = async (data) => {
  const docRef = db.collection("users").doc(data.uid);
  await docRef.set(data);
  console.log("User document written:", data.uid);
  return data.uid;
};

exports.getUserById = async (userId) => {
  const docRef = db.collection("users").doc(userId);
  const snap = await docRef.get();

  if (!snap.exists) throw new Error("User not found");
  return { id: snap.id, ...snap.data() };
}

exports.updateUser = async (userId, data) => {
  const docRef = db.collection("users").doc(userId);
  const snap = await docRef.get();

  if (!snap.exists) throw new Error("User not found");

  await docRef.update({
    ...data,
    updatedAt: new Date()
  });

  console.log("User document updated:", userId);
  return { id: userId, ...data };
}
