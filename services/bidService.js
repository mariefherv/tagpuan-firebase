const { db } = require("../config/firebase.config.js");
const { Timestamp } = require("firebase-admin").firestore;

// Create bid
exports.createBid = async (bidData) => {
    // Check if the request is "Up for Bidding"
    const requestDoc = await db.collection("requests").doc(bidData.request_id).get();
    if (!requestDoc.exists) throw new Error("Request not found");
    if (requestDoc.data().status !== "Up for Bidding") {
        throw new Error("Cannot bid: request is not up for bidding");
    };

    const data = {
        ...bidData,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
    };

    const docRef = db.collection("bids").doc(); // auto-ID
    await docRef.set(data);
    return { id: docRef.id, ...data };
};

// View bid
exports.viewBid = async (bidId) => {
    const doc = await db.collection("bids").doc(bidId).get();
    if (!doc.exists) throw new Error("Bid not found");
    return { id: doc.id, ...doc.data() };
};

// Get bids by request
exports.getBidsByRequest = async (requestId) => {
    const snapshot = await db.collection("bids").where("request_id", "==", requestId).get();
    const bids = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // For farmer details
    const userPromises = bids.map(bid =>
        db.collection("users").doc(bid.farmer_id).get()
    );
    const userDocs = await Promise.all(userPromises);

    return bids.map((bid, idx) => ({
        ...bid,
        user: userDocs[idx].exists ? userDocs[idx].data() : null
    }));
};

// Withdraw bid
exports.withdrawBid = async (bidId) => {
    const bidRef = db.collection("bids").doc(bidId);
    const doc = await bidRef.get();
    if (!doc.exists) throw new Error("Bid not found");

    const bid = doc.data();
    if (bid.status === "Won") throw new Error("Cannot withdraw a winning bid");

    await bidRef.update({
        status: "Withdrawn",
        updated_at: Timestamp.now().toDate().toISOString(),
    });

    return { id: bidId, ...bid, status: "Withdrawn", updated_at: Timestamp.now().toDate().toISOString() };
};

// For withdrawn bids, allow rebidding
exports.rebid = async (bidId, userId) => {
    const bidRef = db.collection("bids").doc(bidId);
    const bidDoc = await bidRef.get();

    if (!bidDoc.exists) {
        throw new Error("Bid not found");
    }

    const bidData = bidDoc.data();
    if (bidData.farmer_id !== userId) {
        throw new Error("User does not own this bid");
    }

    // Check if the request is "Up for Bidding"
    const requestDoc = await db.collection("requests").doc(bidData.request_id).get();
    if (!requestDoc.exists) {
        throw new Error("Request not found");
    }
    if (requestDoc.data().status !== "Up for Bidding") {
        throw new Error("Cannot rebid: request is not up for bidding");
    }

    const updatedData = {
        status: "Pending",
        updated_at: Timestamp.now(),
    };

    await bidRef.update(updatedData);

    // Fetch the updated bid data
    const updatedBidDoc = await bidRef.get();
    return { id: bidId, ...updatedBidDoc.data() };
};

exports.hasActiveBid = async (requestId, userId) => {
    try {
        const snapshot = await db.collection("bids")
            .where("request_id", "==", requestId)
            .where("farmer_id", "==", userId)
            .get();

        const hasActiveBid = !snapshot.empty;
        let status = null;
        let id = null;
        if (hasActiveBid) {
            const doc = snapshot.docs[0];
            status = doc.data().status;
            id = doc.id;
        }
        return { hasActiveBid, status, id };
    } catch (error) {
        if (error.code === 9 && error.message.includes("index")) {
            throw new Error("Firestore index required for this query. Please create the composite index as suggested in the error message.");
        }
        throw error;
    }
};

