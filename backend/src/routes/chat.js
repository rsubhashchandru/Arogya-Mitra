const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/chatController');
const { authenticateUser } = require('../middleware/auth');

// Chat works for both authenticated and unauthenticated users
// but authenticated users get personalized responses
router.post('/', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    return authenticateUser(req, res, next);
  }
  next();
}, chat);

module.exports = router;
