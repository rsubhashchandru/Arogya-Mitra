const express = require('express');
const router = express.Router();
const { upload, extractText } = require('../controllers/ocrController');
const { authenticateUser } = require('../middleware/auth');

router.post('/', authenticateUser, upload.single('prescription'), extractText);

module.exports = router;
