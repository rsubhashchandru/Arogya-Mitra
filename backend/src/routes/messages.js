const express = require('express');
const router = express.Router();
const { sendMessage, getConversations, getChatThread, getAvailableDoctors } = require('../controllers/messageController');
const { authenticateUser } = require('../middleware/auth');

router.post('/send', authenticateUser, sendMessage);
router.get('/', authenticateUser, getConversations);
router.get('/doctors/list', authenticateUser, getAvailableDoctors);
router.get('/:partnerId', authenticateUser, getChatThread);

module.exports = router;
