const express = require('express');
const conversationController = require('../controllers/conversationController');
const router = express.Router();
const { isAuthenticated } = require("../auth");


router.post('/create/:otherUserId', isAuthenticated, conversationController.createConversation);
router.post('/send/:conversationId', isAuthenticated, conversationController.sendMessage);
router.get('/get/:conversationId', isAuthenticated, conversationController.getConversation);
router.get('/user', isAuthenticated, conversationController.getUserConversations);

module.exports = router;