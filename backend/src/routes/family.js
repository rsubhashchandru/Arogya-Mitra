const express = require('express');
const router = express.Router();
const { createFamily, addMember, getFamilies, deleteFamily, getMemberHealth } = require('../controllers/familyController');
const { authenticateUser } = require('../middleware/auth');

router.post('/', authenticateUser, createFamily);
router.post('/add-member', authenticateUser, addMember);
router.get('/', authenticateUser, getFamilies);
router.delete('/:id', authenticateUser, deleteFamily);
router.get('/member/:userId/health', authenticateUser, getMemberHealth);

module.exports = router;
