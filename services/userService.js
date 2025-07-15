const { db } = require("../config/firebase.config.js");

exports.getUserDetails = async (userId) => {
  const docRef = db.collection("users").doc(userId);
  const snap = await docRef.get();

  if (!snap.exists) throw new Error("User not found");
  const data = snap.data();

  // If user is a Farmer, retrieve all commodity names
  if (data.role === "Farmer" && Array.isArray(data.farmer_details?.commodity)) {
    const commodityIds = data.farmer_details.commodity;

    const commodityDocs = await Promise.all(
      commodityIds.map(id => db.collection("commodities").doc(id).get())
    );

    const commodities = commodityDocs.map((docSnap, index) => {
      if (docSnap.exists) {
        const c = docSnap.data();
        return {
          id: docSnap.id,
          name: `${c.en_name} (${c.hil_name})`
        };
      } else {
        return {
          id: commodityIds[index],
          name: null
        };
      }
    });

    // Replace the original commodity array
    data.farmer_details.commodity = commodities;
  }

  return { id: snap.id, ...data };
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

exports.getFarmers = async () => {
  const snapshot = await db.collection("users").where("role", "==", "Farmer").get();
  if (snapshot.empty) return [];

  const users = await Promise.all(
    snapshot.docs.map(doc => exports.getUserDetails(doc.id))
  );

  return users;
}

exports.getUnverifiedUsers = async () => {
  const snapshot = await db.collection("users").where("verification", "==", "Pending").get();
  if (snapshot.empty) return [];

  const users = await Promise.all(
    snapshot.docs.map(doc => exports.getUserDetails(doc.id))
  );
  return users;
}

exports.verifyUser = async (userId) => {
  const docRef = db.collection("users").doc(userId);
  const snap = await docRef.get();

  if (!snap.exists) throw new Error("User not found");

  await docRef.update({
    verification: "Approved",
    verifiedAt: new Date()
  });

  return { id: userId, verification: "Approved" };
}

exports.rejectUser = async (userId) => {
  const docRef = db.collection("users").doc(userId);
  const snap = await docRef.get();

  if (!snap.exists) throw new Error("User not found");

  await docRef.update({
    verification: "Rejected",
    rejectedAt: new Date()
  });

  return { id: userId, verification: "Rejected" };
}