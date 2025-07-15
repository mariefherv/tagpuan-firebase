const { z } = require("zod");

const messageSchema = z.object({
    sender_id: z.string().min(1, "Sender ID required").default(""),
    content: z.string().min(1, "Message content required").default(""),
    timestamp: z.any().optional().default(() => new Date()), // Defaults to current time
    isRead: z.boolean().optional().default(false),
});

const conversationValidator = z.object({
    participants: z.array(z.string().min(1)).min(1),
    messages: z.array(messageSchema).optional(),
    hasUnread: z.record(z.string(), z.boolean()).optional(), // { userId1: true, userId2: false }
});


module.exports = { messageSchema, conversationValidator };
