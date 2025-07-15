const { db } = require("../config/firebase.config.js");
const { Timestamp, FieldValue } = require("firebase-admin/firestore");

// Create a new conversation with participants
module.exports.createConversation = async (participants) => {
    // Initialize hasUnread for each participant as false
    const hasUnread = {};
    participants.forEach(p => { hasUnread[p] = false; });
    const data = { participants, messages: [], hasUnread };

    const snapshot = await db.collection("conversations")
        .where("participants", "array-contains", participants[0])
        .get();

    const existing = snapshot.docs.find(doc => {
        const docParticipants = doc.data().participants;
        return docParticipants.length === participants.length &&
            docParticipants.every(p => participants.includes(p));
    });

    if (existing) {
        return { id: existing.id, ...existing.data() };
    }

    const ref = await db.collection("conversations").add(data);
    return { id: ref.id, ...data };
};

// Send a message to a conversation
module.exports.sendMessage = async (conversationId, message) => {
    message.timestamp = message.timestamp || Timestamp.now();

    const docRef = db.collection("conversations").doc(conversationId);
    const doc = await docRef.get();

    if (!doc.exists) throw new Error("Conversation not found");

    const data = doc.data();

    if (!Array.isArray(data.participants)) {
        throw new Error("Conversation participants are missing or invalid");
    }

    const updatedHasUnread = { ...(data.hasUnread || {}) };
    data.participants.forEach(p => {
        if (p !== message.sender_id) updatedHasUnread[p] = true;
    });

    console.log("Prepared message:", message);
    console.log("hasUnread:", updatedHasUnread);

    await docRef.update({
        messages: FieldValue.arrayUnion(message),
        hasUnread: updatedHasUnread,
    });

    return message;
};


// Get a specific conversation and its paginated, sorted messages from a subcollection
module.exports.getConversation = async (conversationId, userId) => {
    const docRef = db.collection("conversations").doc(conversationId);
    const doc = await docRef.get();
    if (!doc.exists) throw new Error("Conversation not found");
    const data = doc.data();

    // Mark hasUnread as false for the logged in user if present
    if (userId && data.hasUnread && data.hasUnread[userId]) {
        const updatedHasUnread = { ...data.hasUnread, [userId]: false };
        await docRef.update({ hasUnread: updatedHasUnread });
        data.hasUnread[userId] = false;
    }

    return { id: doc.id, ...data };
};

// Get all conversations for a user, sorted by last message sent
module.exports.getUserConversations = async (userId) => {
    const snapshot = await db.collection("conversations")
        .where("participants", "array-contains", userId)
        .get();

    const conversations = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        const lastMsg = (data.messages || []).reduce((latest, msg) => {
            const ts = msg.timestamp?.toMillis?.() || 0;
            return ts > (latest?.timestamp?.toMillis?.() || 0) ? msg : latest;
        }, null);
        conversations.push({
            id: doc.id,
            ...data,
            lastMessageTimestamp: lastMsg?.timestamp?.toMillis?.() || 0,
        });
    });

    conversations.sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
    return conversations;
};
