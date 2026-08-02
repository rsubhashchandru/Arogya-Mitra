const express = require('express');
const router = express.Router();
const { addMedicine, getMedicines, deleteMedicine, toggleMedicine } = require('../controllers/medicineController');
const { authenticateUser } = require('../middleware/auth');

router.post('/', authenticateUser, addMedicine);
router.get('/', authenticateUser, getMedicines);
router.delete('/:id', authenticateUser, deleteMedicine);
router.patch('/:id/toggle', authenticateUser, toggleMedicine);

module.exports = router;
