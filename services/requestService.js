const { db } = require("../config/firebase.config.js");
const { Timestamp } = require("firebase-admin").firestore;

exports.createRequest = async (data) => {
  const requestData = {
    ...data,
    schedule: data.schedule
      ? Timestamp.fromDate(new Date(`${data.schedule}T23:59:00+08:00`))
      : null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };

  const docRef = await db.collection("requests").doc(); // auto-ID
  await docRef.set(requestData);
  return docRef.id;
};

exports.getRequestbyId = async (id) => {
  const docRef = db.collection("requests").doc(id);
  const snap = await docRef.get();

  if (!snap.exists) throw new Error("Request not found");
  const data = snap.data();

  let commodity = null;
  if (data.commodity) {
    const commoditySnap = await db.collection("commodities").doc(data.commodity).get();
    if (commoditySnap.exists) {
      const commodityData = commoditySnap.data();
      commodity = {
        id: commoditySnap.id,
        name: `${commodityData.en_name} (${commodityData.hil_name})`
      };
    } else {
      commodity = { id: data.commodity, name: null };
    }
  }
  return { ...data, commodity };
};

exports.getAllRequests = async () => {
  const snapshot = await db.collection("requests").orderBy("schedule", "asc").get();
  const requests = [];

  for (const doc of snapshot.docs) {
    const data = doc.data();
    let commodity = null;
    if (data.commodity) {
      const commoditySnap = await db.collection("commodities").doc(data.commodity).get();
      if (commoditySnap.exists) {
        const commodityData = commoditySnap.data();
        commodity = {
          id: commoditySnap.id,
          name: `${commodityData.en_name} (${commodityData.hil_name})`
        };
      } else {
        commodity = { id: data.commodity, name: null };
      }
    }
    requests.push({ id: doc.id, ...data, commodity });
  }
  return requests;
};

exports.getRequestsByUser = async (userId) => {
  const snapshot = await db.collection("requests").where("contractor_id", "==", userId).orderBy("schedule", "asc").get();
  const requests = [];

  for (const doc of snapshot.docs) {
    const data = doc.data();
    let commodity = null;
    if (data.commodity) {
      const commoditySnap = await db.collection("commodities").doc(data.commodity).get();
      if (commoditySnap.exists) {
        const commodityData = commoditySnap.data();
        commodity = {
          id: commoditySnap.id,
          name: `${commodityData.en_name} (${commodityData.hil_name})`
        };
      } else {
        commodity = { id: data.commodity, name: null };
      }
    }
    requests.push({ id: doc.id, ...data, commodity });
  }

  return requests;
};

// Update bids on request
exports.setWinningBid = async (reqId, bidId) => {
  if (!bidId || !reqId) {
    throw new Error("Bid ID and Request ID are required");
  }
  const bidRef = db.collection("bids").doc(bidId);

  // Set the current bid as "Won"
  const doc = await bidRef.get();
  if (!doc.exists) throw new Error("Bid not found");

  const updatedData = {
    status: "Won",
    updated_at: Timestamp.now().toDate().toISOString(),
  };
  await bidRef.update(updatedData);

  // Set other bids for the same request to "Lost" (if not "Withdrawn")
  const snapshot = await db.collection("bids")
    .where("request_id", "==", reqId)
    .get();

  const batch = db.batch();
  snapshot.docs.forEach(otherDoc => {
    if (otherDoc.id !== bidId && otherDoc.data().status !== "Withdrawn") {
      batch.update(otherDoc.ref, {
        status: "Lost",
        updated_at: Timestamp.now().toDate().toISOString(),
      });
    }
  });

  // Update request status to "Pending"
  const requestRef = db.collection("requests").doc(reqId);
  batch.update(requestRef, {
    status: "Pending",
    updatedAt: Timestamp.now()
  });

  await batch.commit();

  return { id: bidId, ...doc.data(), ...updatedData };
};

// Get winning bid for a request
exports.getWinningBid = async (requestId) => {
  const snapshot = await db.collection("bids")
    .where("request_id", "==", requestId)
    .where("status", "==", "Won")
    .get();

  if (snapshot.empty) throw new Error("No winning bid found for this request");

  if (snapshot.docs.length > 1) {
    console.warn(`Warning: Multiple bids with status "Won" found for request ${requestId}. Returning the first one.`);
  }
  const winningBid = snapshot.docs[0].data();
  return { id: snapshot.docs[0].id, ...winningBid };
}

// Create a direct request to a farmer
exports.createDirectRequest = async (farmerId, userId, data) => {
  if (!farmerId || !userId || !data) {
    throw new Error("Farmer ID, User ID, and request data are required");
  }

  const requestData = {
    ...data,
    schedule: data.schedule
      ? Timestamp.fromDate(new Date(`${data.schedule}T23:59:00+08:00`))
      : null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    status: "Pending"
  };

  const docRef = await db.collection("requests").doc(); // auto-ID
  await docRef.set(requestData);

  // Create a bid for the farmer
  const bidData = {
    request_id: docRef.id,
    farmer_id: farmerId,
    contractor_id: userId,
    status: "Won",
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
  };

  const bidRef = db.collection("bids").doc();
  await bidRef.set(bidData);

  return docRef.id;
};
