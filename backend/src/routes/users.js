const express = require('express');
const router = express.Router();
const { simpleRegister, simpleLogin, getProfile, updateProfile } = require('../controllers/userController');
const { authenticateUser } = require('../middleware/auth');

// Simple auth — no passwords
router.post('/register', simpleRegister);
router.post('/login', simpleLogin);

// Protected
router.get('/profile', authenticateUser, getProfile);
router.put('/profile', authenticateUser, updateProfile);

module.exports = router;
