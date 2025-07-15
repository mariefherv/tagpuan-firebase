const conversationService = require("../services/conversationService");
const { conversationValidator } = require("../validators/conversationValidator");
const { messageSchema } = require("../validators/conversationValidator");

// Create a new conversation
module.exports.createConversation = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { otherUserId } = req.params;
        const participants = [userId, otherUserId];

        // Validate participants using the new schema
        conversationValidator.parse({ participants });

        const conversation = await conversationService.createConversation(participants);
        res.status(201).json(conversation);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Send a message to a conversation
module.exports.sendMessage = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const message = { ...req.body, sender_id: req.user.userId };

        // Debug: log incoming message and conversationId
        console.debug("sendMessage: conversationId =", conversationId);
        console.debug("sendMessage: message =", message);

        // Validate message using the new schema
        messageSchema.parse(message);

        const sentMessage = await conversationService.sendMessage(conversationId, message);

        // Debug: log sent message
        console.debug("sendMessage: sentMessage =", sentMessage);

        res.status(200).json(sentMessage);
    } catch (err) {
        // Debug: log error details
        console.error("sendMessage error:", err);
        res.status(400).json({ error: err.message });
    }
};

// Get a specific conversation
module.exports.getConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.userId;
        const conversation = await conversationService.getConversation(conversationId, userId);
        res.status(200).json(conversation);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};

// Get all conversations for a user
module.exports.getUserConversations = async (req, res) => {
    try {
        const userId = req.user.userId;
        const conversations = await conversationService.getUserConversations(userId);
        res.status(200).json(conversations);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
